import type { CampaignBulkAction, CampaignInput, CampaignsApiClient } from '@/services/api/campaigns'
import type { Campaign, CampaignFilterField, CampaignStatus, CampaignWithMetrics } from '@/types'
import { request, type RequestContext } from '../core/context'
import { applyListParams, filterRows, type ListSpec } from '../core/list-engine'
import { diffValues, recordAudit } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import { sumMetrics } from '@/lib/metrics'
import { openMetricsScope, withMetrics } from './campaign-data'
import {
  mockCampaignBreakdown,
  mockCampaignDetail,
  mockCampaignFunnel,
  mockCampaignTimeSeries,
} from './campaign-detail'

function listSpec(ctx: RequestContext): ListSpec<CampaignWithMetrics, CampaignFilterField> {
  return {
    fields: FIELDS,
    value: fieldValue,
    searchable: (c) => [c.name, c.platform, c.objective, ...c.tags],
    defaultSort: [{ field: 'startDate', direction: 'desc' }],
    now: ctx.now,
  }
}

const FIELDS: readonly CampaignFilterField[] = [
  'name',
  'platform',
  'status',
  'ownerId',
  'startDate',
  'spend',
  'roas',
  'leads',
  'revenue',
  'cpl',
  'overspent',
]
function fieldValue(row: CampaignWithMetrics, field: CampaignFilterField) {
  switch (field) {
    case 'spend':
      return row.metrics.spend
    case 'roas':
      return row.metrics.roas
    case 'leads':
      return row.metrics.leads
    case 'revenue':
      return row.metrics.revenue
    case 'cpl':
      return row.metrics.cpl
    case 'overspent':
      return row.metrics.spend === null ? null : row.metrics.spend > row.budget
    default:
      return row[field]
  }
}

function validate(ctx: RequestContext, input: Partial<CampaignInput>): void {
  if (input.name !== undefined && !input.name.trim()) throw validationError('name', 'Name is required.')
  if (input.budget !== undefined && !(input.budget >= 0)) {
    throw validationError('budget', 'Enter an amount of zero or more.')
  }
  if (input.ownerId !== undefined && !ctx.db.find('users', input.ownerId)) {
    throw validationError('ownerId', 'Pick an owner from your workspace.')
  }
  const { startDate, endDate } = input
  if (startDate && Number.isNaN(Date.parse(startDate))) throw validationError('startDate', 'Pick a valid date.')
  if (startDate && endDate && Date.parse(endDate) < Date.parse(startDate)) {
    throw validationError('endDate', 'The end date must be after the start date.')
  }
}

export function requireCampaign(ctx: RequestContext, id: string): Campaign {
  return ctx.db.get('campaigns', id, 'Campaign')
}

const BULK_TARGET: Record<Exclude<CampaignBulkAction, 'archive'>, [from: CampaignStatus, to: CampaignStatus]> = {
  pause: ['active', 'paused'],
  resume: ['paused', 'active'],
}

export const mockCampaignsApi: CampaignsApiClient = {
  list: (params) =>
    request((ctx) => {
      ctx.require('campaigns', 'view')
      const scope = openMetricsScope(ctx)
      const rows = ctx.db
        .all('campaigns')
        .filter((c) => params?.includeArchived || !c.archivedAt)
        .map((c) => withMetrics(ctx, scope, c, params?.range))
      return applyListParams(rows, params, listSpec(ctx), 'campaigns')
    }),
  getSummary: (params) =>
    request((ctx) => {
      ctx.require('campaigns', 'view')
      const scope = openMetricsScope(ctx)
      const rows = ctx.db
        .all('campaigns')
        .filter((c) => params?.includeArchived || !c.archivedAt)
        .map((c) => withMetrics(ctx, scope, c, params?.range))
      return sumMetrics(filterRows(rows, params, listSpec(ctx), 'campaigns').map((row) => row.metrics))
    }),
  get: (id) =>
    request((ctx) => {
      ctx.require('campaigns', 'view')
      return withMetrics(ctx, openMetricsScope(ctx), requireCampaign(ctx, id))
    }),
  create: (input) =>
    request((ctx) => {
      ctx.require('campaigns', 'create')
      validate(ctx, input)
      if (!input.name.trim()) throw validationError('name', 'Name is required.')
      const campaign = ctx.db.insert('campaigns', {
        ...input,
        id: newId('campaign'),
        name: input.name.trim(),
        endDate: input.endDate ?? null,
        archivedAt: null,
        createdAt: ctx.timestamp,
      })
      recordAudit(ctx, {
        action: 'created',
        entity: 'campaign',
        entityId: campaign.id,
        entityLabel: campaign.name,
        newValue: { platform: campaign.platform, status: campaign.status, budget: campaign.budget },
      })
      return withMetrics(ctx, openMetricsScope(ctx), campaign)
    }),
  update: (id, patch) =>
    request((ctx) => {
      ctx.require('campaigns', 'edit')
      const campaign = requireCampaign(ctx, id)
      validate(ctx, patch)
      const saved = ctx.db.save('campaigns', { ...campaign, ...patch, id, tenantId: campaign.tenantId })
      const diff = diffValues(campaign, saved, ['name', 'status', 'budget', 'endDate', 'ownerId', 'platform'])
      if (diff) {
        recordAudit(ctx, { action: 'updated', entity: 'campaign', entityId: id, entityLabel: saved.name, ...diff })
      }
      return withMetrics(ctx, openMetricsScope(ctx), saved)
    }),
  delete: (id) =>
    request((ctx) => {
      ctx.require('campaigns', 'delete')
      const campaign = requireCampaign(ctx, id)
      ctx.db.remove('campaigns', id)
      for (const row of ctx.db.all('adSets')) if (row.campaignId === id) ctx.db.remove('adSets', row.id)
      for (const row of ctx.db.all('ads')) if (row.campaignId === id) ctx.db.remove('ads', row.id)
      for (const row of ctx.db.all('spendEntries')) if (row.campaignId === id) ctx.db.remove('spendEntries', row.id)
      for (const lead of ctx.db.all('leads')) {
        if (lead.campaignId === id) ctx.db.save('leads', { ...lead, campaignId: null, adSetId: null, adId: null })
      }
      recordAudit(ctx, { action: 'deleted', entity: 'campaign', entityId: id, entityLabel: campaign.name })
    }),
  bulkAction: (ids, action) =>
    request((ctx) => {
      ctx.require('campaigns', 'edit')
      for (const id of ids) {
        const campaign = requireCampaign(ctx, id)
        const next: Campaign = { ...campaign }
        if (action === 'archive') next.archivedAt = ctx.timestamp
        else {
          const [from, to] = BULK_TARGET[action]
          if (campaign.status !== from) continue
          next.status = to
        }
        ctx.db.save('campaigns', next)
        recordAudit(ctx, {
          action: 'updated',
          entity: 'campaign',
          entityId: id,
          entityLabel: campaign.name,
          previousValue: { status: campaign.status, archived: Boolean(campaign.archivedAt) },
          newValue: { status: next.status, archived: Boolean(next.archivedAt) },
        })
      }
    }),
  listActivity: (id) =>
    request((ctx) => {
      ctx.require('campaigns', 'view')
      requireCampaign(ctx, id)
      return ctx.db
        .all('auditLogs')
        .filter((log) => log.entityId === id && (log.entity === 'campaign' || log.entity === 'spend'))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 100)
    }),
  getDetail: (id, query) => request((ctx) => mockCampaignDetail(ctx, requireCampaign(ctx, id), query)),
  getFunnel: (id, query) => request((ctx) => mockCampaignFunnel(ctx, requireCampaign(ctx, id), query)),
  getTimeSeries: (id, query) => request((ctx) => mockCampaignTimeSeries(ctx, requireCampaign(ctx, id), query)),
  getBreakdown: (id, query) => request((ctx) => mockCampaignBreakdown(ctx, requireCampaign(ctx, id), query)),
}
