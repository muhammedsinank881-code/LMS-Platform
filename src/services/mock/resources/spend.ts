import type { SpendApiClient } from '@/services/api/spend'
import type { SpendEntry, SpendFilterField, SpendImportResult, SpendInput } from '@/types'
import { request, type RequestContext } from '../core/context'
import { applyListParams, propertyValue, type ListSpec } from '../core/list-engine'
import { recordAudit } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'

const FIELDS: readonly SpendFilterField[] = ['campaignId', 'adSetId', 'adId', 'date', 'source']
const DATE = /^\d{4}-\d{2}-\d{2}$/

function open(ctx: RequestContext, write: boolean): void {
  ctx.require('campaigns', write ? 'edit' : 'view')
  ctx.requireFeature('view-spend')
}

function validate(ctx: RequestContext, input: Partial<SpendInput>): void {
  if (input.date !== undefined && (!DATE.test(input.date) || Number.isNaN(Date.parse(input.date)))) {
    throw validationError('date', 'Use a valid date (yyyy-mm-dd).')
  }
  if (input.amount !== undefined && !(input.amount > 0)) throw validationError('amount', 'Enter an amount above zero.')
  if (input.adSetId && ctx.db.find('adSets', input.adSetId)?.campaignId !== input.campaignId) {
    throw validationError('adSetId', 'That ad set is not in this campaign.')
  }
  if (input.adId && ctx.db.find('ads', input.adId)?.campaignId !== input.campaignId) {
    throw validationError('adId', 'That ad is not in this campaign.')
  }
}

function audit(ctx: RequestContext, campaignId: string, action: 'created' | 'updated' | 'deleted' | 'imported', detail: Record<string, string | number>) {
  const campaign = ctx.db.get('campaigns', campaignId, 'Campaign')
  recordAudit(ctx, { action, entity: 'spend', entityId: campaignId, entityLabel: campaign.name, newValue: detail })
}

const currencyOf = (ctx: RequestContext) => ctx.db.find('tenantSettings', ctx.tenantId)?.workspace.currency ?? 'INR'

export const mockSpendApi: SpendApiClient = {
  list: (params) =>
    request((ctx) => {
      open(ctx, false)
      const rows = ctx.db.all('spendEntries').filter((row) => row.campaignId === params.campaignId)
      const spec: ListSpec<SpendEntry, SpendFilterField> = {
        fields: FIELDS,
        value: propertyValue,
        searchable: (row) => [row.notes, row.date],
        defaultSort: [{ field: 'date', direction: 'desc' }],
        now: ctx.now,
      }
      return applyListParams(rows, params, spec, 'spend entries')
    }),
  create: (input) =>
    request((ctx) => {
      open(ctx, true)
      ctx.db.get('campaigns', input.campaignId, 'Campaign')
      validate(ctx, input)
      const row = ctx.db.insert('spendEntries', {
        ...input,
        id: newId('spend'),
        currency: input.currency || currencyOf(ctx),
        source: input.source ?? 'manual',
      })
      audit(ctx, row.campaignId, 'created', { date: row.date, amount: row.amount })
      return row
    }),
  update: (id, patch) =>
    request((ctx) => {
      open(ctx, true)
      const row = ctx.db.get('spendEntries', id, 'Spend entry')
      const next = { ...row, ...patch, id, tenantId: row.tenantId, campaignId: row.campaignId }
      validate(ctx, next)
      const saved = ctx.db.save('spendEntries', next)
      audit(ctx, row.campaignId, 'updated', { date: saved.date, amount: saved.amount })
      return saved
    }),
  delete: (id) =>
    request((ctx) => {
      open(ctx, true)
      const row = ctx.db.get('spendEntries', id, 'Spend entry')
      ctx.db.remove('spendEntries', id)
      audit(ctx, row.campaignId, 'deleted', { date: row.date, amount: row.amount })
    }),
  importCsv: (campaignId, rows) =>
    request((ctx): SpendImportResult => {
      open(ctx, true)
      ctx.db.get('campaigns', campaignId, 'Campaign')
      const adSets = ctx.db.all('adSets').filter((row) => row.campaignId === campaignId)
      const ads = ctx.db.all('ads').filter((row) => row.campaignId === campaignId)
      const result: SpendImportResult = { imported: 0, skipped: 0, errors: [] }
      const find = <T extends { id: string; name: string }>(list: T[], key?: string) =>
        key ? list.find((row) => row.id === key || row.name.toLowerCase() === key.trim().toLowerCase()) : undefined

      rows.forEach((raw, index) => {
        const line = index + 2
        const amount = Number(String(raw.amount).replace(/[,₹\s]/g, ''))
        const adSet = find(adSets, raw.adSet)
        const ad = find(ads, raw.ad)
        const problem = !DATE.test(raw.date?.trim() ?? '') || Number.isNaN(Date.parse(raw.date))
          ? 'Date must be yyyy-mm-dd.'
          : !(amount > 0)
            ? 'Amount must be a number above zero.'
            : raw.adSet && !adSet
              ? `Unknown ad set "${raw.adSet}".`
              : raw.ad && !ad
                ? `Unknown ad "${raw.ad}".`
                : null
        if (problem) {
          result.skipped += 1
          result.errors.push({ row: line, message: problem })
          return
        }
        ctx.db.insert('spendEntries', {
          id: newId('spend'),
          campaignId,
          adSetId: ad?.adSetId ?? adSet?.id ?? null,
          adId: ad?.id ?? null,
          date: raw.date.trim(),
          amount,
          currency: currencyOf(ctx),
          source: 'manual',
          notes: raw.notes?.trim() ?? '',
        })
        result.imported += 1
      })
      audit(ctx, campaignId, 'imported', { imported: result.imported, skipped: result.skipped })
      return result
    }),
}
