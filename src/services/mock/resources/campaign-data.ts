import { calendarDayKey } from '@/lib/date-range'
import { computeMetrics, groupByDay, ratio, redactSpend, roundMoney } from '@/lib/metrics'
import type {
  Campaign,
  CampaignMetrics,
  CampaignWithMetrics,
  DateRange,
  Deal,
  Lead,
  PipelineStage,
  Resource,
  SpendEntry,
} from '@/types'
import type { RequestContext } from '../core/context'

export interface MetricsFilter {
  campaignId?: string
  adSetId?: string
  adId?: string
  /** Only leads and spend that belong to the campaign but to no ad set. */
  unallocated?: boolean
}

/** Everything metrics need, already limited to what the caller's role may see. */
export interface MetricsScope {
  canSpend: boolean
  stages: PipelineStage[]
  leads: Lead[]
  deals: Deal[]
  entries: SpendEntry[]
}

export function openMetricsScope(ctx: RequestContext, resource: Resource = 'campaigns'): MetricsScope {
  const canSpend = ctx.hasFeature('view-spend')
  const leads = ctx.db
    .all('leads')
    .filter((lead) => !lead.archivedAt && ctx.inScope(resource, lead.assignedTo, lead.createdBy))
  return {
    canSpend,
    stages: ctx.db.all('stages'),
    leads,
    deals: ctx.db.all('deals'),
    entries: canSpend ? ctx.db.all('spendEntries') : [],
  }
}

function inDays(day: string | null, range: DateRange | undefined): boolean {
  if (!range) return true
  const from = calendarDayKey(range.from)
  const to = calendarDayKey(range.to)
  return Boolean(day && from && to && day >= from && day <= to)
}

export const leadInRange = (lead: Lead, range?: DateRange) => inDays(calendarDayKey(lead.createdAt), range)

function matches(
  item: { campaignId?: string | null; adSetId?: string | null; adId?: string | null },
  filter: MetricsFilter,
): boolean {
  if (filter.campaignId && item.campaignId !== filter.campaignId) return false
  if (filter.adSetId && item.adSetId !== filter.adSetId) return false
  if (filter.adId && item.adId !== filter.adId) return false
  if (filter.unallocated && item.adSetId) return false
  return true
}

export function leadsFor(scope: MetricsScope, filter: MetricsFilter, range?: DateRange): Lead[] {
  return scope.leads.filter((lead) => matches(lead, filter) && leadInRange(lead, range))
}

export function spendFor(scope: MetricsScope, filter: MetricsFilter, range?: DateRange): number {
  return scope.entries
    .filter((entry) => matches(entry, filter) && inDays(entry.date, range))
    .reduce((sum, entry) => sum + entry.amount, 0)
}

/** Metrics for a campaign, ad set or ad. Spend-derived figures are null without view-spend. */
export function metricsFor(scope: MetricsScope, filter: MetricsFilter, range?: DateRange): CampaignMetrics {
  const metrics = computeMetrics(
    spendFor(scope, filter, range),
    leadsFor(scope, filter, range),
    scope.deals,
    scope.stages,
  )
  return scope.canSpend ? metrics : redactSpend(metrics)
}

/** Workspace-wide cost per lead for the range, over every campaign lead. Null without spend access. */
export function tenantAvgCpl(scope: MetricsScope, range?: DateRange): number | null {
  if (!scope.canSpend) return null
  const spend = scope.entries
    .filter((entry) => inDays(entry.date, range))
    .reduce((sum, entry) => sum + entry.amount, 0)
  const leads = scope.leads.filter((lead) => lead.campaignId && leadInRange(lead, range)).length
  const value = ratio(spend, leads)
  return value === null ? null : roundMoney(value)
}

const DAY_MS = 86_400_000
const TREND_DAYS = 14

export function withMetrics(
  ctx: RequestContext,
  scope: MetricsScope,
  campaign: Campaign,
  range?: DateRange,
): CampaignWithMetrics {
  const trendRange = { from: new Date(ctx.now.getTime() - TREND_DAYS * DAY_MS).toISOString(), to: ctx.timestamp }
  const recent = leadsFor(scope, { campaignId: campaign.id }, trendRange)
  return {
    ...campaign,
    metrics: metricsFor(scope, { campaignId: campaign.id }, range),
    trend: groupByDay(recent, trendRange, 'createdAt').map((point) => point.count),
  }
}

