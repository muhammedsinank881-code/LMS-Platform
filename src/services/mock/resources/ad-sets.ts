import type { AdSetsApiClient } from '@/services/api/ad-sets'
import { request, type RequestContext } from '../core/context'
import { diffValues, recordAudit } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'

function requireName(name: string | undefined): void {
  if (name !== undefined && !name.trim()) throw validationError('name', 'Name is required.')
}

function auditTarget(ctx: RequestContext, campaignId: string, action: 'created' | 'updated' | 'deleted', label: string) {
  const campaign = ctx.db.get('campaigns', campaignId, 'Campaign')
  recordAudit(ctx, {
    action,
    entity: 'campaign',
    entityId: campaignId,
    entityLabel: campaign.name,
    newValue: { [action === 'deleted' ? 'removed' : 'changed']: label },
  })
}

export const mockAdSetsApi: AdSetsApiClient = {
  listAdSets: (campaignId) =>
    request((ctx) => {
      ctx.require('campaigns', 'view')
      return ctx.db.all('adSets').filter((row) => row.campaignId === campaignId)
    }),
  createAdSet: (input) =>
    request((ctx) => {
      ctx.require('campaigns', 'edit')
      ctx.db.get('campaigns', input.campaignId, 'Campaign')
      requireName(input.name)
      if (!input.name.trim()) throw validationError('name', 'Name is required.')
      const row = ctx.db.insert('adSets', { ...input, id: newId('adset'), name: input.name.trim(), createdAt: ctx.timestamp })
      auditTarget(ctx, row.campaignId, 'updated', `Ad set ${row.name} added`)
      return row
    }),
  updateAdSet: (id, patch) =>
    request((ctx) => {
      ctx.require('campaigns', 'edit')
      const row = ctx.db.get('adSets', id, 'Ad set')
      requireName(patch.name)
      const saved = ctx.db.save('adSets', { ...row, ...patch, id, campaignId: row.campaignId, tenantId: row.tenantId })
      const diff = diffValues(row, saved, ['name', 'status'])
      if (diff) auditTarget(ctx, row.campaignId, 'updated', `Ad set ${saved.name} edited`)
      return saved
    }),
  deleteAdSet: (id) =>
    request((ctx) => {
      ctx.require('campaigns', 'delete')
      const row = ctx.db.get('adSets', id, 'Ad set')
      for (const ad of ctx.db.all('ads')) if (ad.adSetId === id) ctx.db.remove('ads', ad.id)
      for (const lead of ctx.db.all('leads')) {
        if (lead.adSetId === id) ctx.db.save('leads', { ...lead, adSetId: null, adId: null })
      }
      for (const entry of ctx.db.all('spendEntries')) {
        if (entry.adSetId === id) ctx.db.save('spendEntries', { ...entry, adSetId: null, adId: null })
      }
      ctx.db.remove('adSets', id)
      auditTarget(ctx, row.campaignId, 'deleted', `Ad set ${row.name}`)
    }),
  listAds: (campaignId) =>
    request((ctx) => {
      ctx.require('campaigns', 'view')
      return ctx.db.all('ads').filter((row) => row.campaignId === campaignId)
    }),
  createAd: (input) =>
    request((ctx) => {
      ctx.require('campaigns', 'edit')
      const adSet = ctx.db.get('adSets', input.adSetId, 'Ad set')
      requireName(input.name)
      if (!input.name.trim()) throw validationError('name', 'Name is required.')
      const row = ctx.db.insert('ads', {
        ...input,
        id: newId('ad'),
        name: input.name.trim(),
        campaignId: adSet.campaignId,
        createdAt: ctx.timestamp,
      })
      auditTarget(ctx, row.campaignId, 'updated', `Ad ${row.name} added`)
      return row
    }),
  updateAd: (id, patch) =>
    request((ctx) => {
      ctx.require('campaigns', 'edit')
      const row = ctx.db.get('ads', id, 'Ad')
      requireName(patch.name)
      const saved = ctx.db.save('ads', { ...row, ...patch, id, adSetId: row.adSetId, campaignId: row.campaignId, tenantId: row.tenantId })
      const diff = diffValues(row, saved, ['name', 'status'])
      if (diff) auditTarget(ctx, row.campaignId, 'updated', `Ad ${saved.name} edited`)
      return saved
    }),
  deleteAd: (id) =>
    request((ctx) => {
      ctx.require('campaigns', 'delete')
      const row = ctx.db.get('ads', id, 'Ad')
      for (const lead of ctx.db.all('leads')) if (lead.adId === id) ctx.db.save('leads', { ...lead, adId: null })
      for (const entry of ctx.db.all('spendEntries')) {
        if (entry.adId === id) ctx.db.save('spendEntries', { ...entry, adId: null })
      }
      ctx.db.remove('ads', id)
      auditTarget(ctx, row.campaignId, 'deleted', `Ad ${row.name}`)
    }),
}
