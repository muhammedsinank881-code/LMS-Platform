import { calendarDayKey, eachCalendarDay } from '@/lib/date-range'
import { previousPeriod, ratio } from '@/lib/metrics'
import type {
  BreakdownMetricsRow,
  Campaign,
  CampaignDetailMetrics,
  CampaignMetrics,
  CampaignMetricsQuery,
  CampaignTimePoint,
  FunnelStep,
} from '@/types'
import type { RequestContext } from '../core/context'
import {
  leadsFor,
  metricsFor,
  openMetricsScope,
  tenantAvgCpl,
  withMetrics,
  type MetricsFilter,
} from './campaign-data'

const pct = (part: number, whole: number) => {
  const value = ratio(part, whole)
  return value === null ? null : value * 100
}

export function mockCampaignDetail(
  ctx: RequestContext,
  campaign: Campaign,
  query: CampaignMetricsQuery,
): CampaignDetailMetrics {
  ctx.require('campaigns', 'view')
  const scope = openMetricsScope(ctx)
  const before = query.compare ? previousPeriod(query.range) : null
  return {
    campaign: withMetrics(ctx, scope, campaign, query.range),
    previous: before ? metricsFor(scope, { campaignId: campaign.id }, before) : null,
    tenantAvgCpl: tenantAvgCpl(scope, query.range),
  }
}

export function mockCampaignFunnel(
  ctx: RequestContext,
  campaign: Campaign,
  query: CampaignMetricsQuery,
): FunnelStep[] {
  ctx.require('campaigns', 'view')
  const m = metricsFor(openMetricsScope(ctx), { campaignId: campaign.id }, query.range)
  return [
    { label: 'Spend', value: m.spend, conversionFromPrevious: null },
    { label: 'Leads', value: m.leads, conversionFromPrevious: null },
    { label: 'Qualified', value: m.qualified, conversionFromPrevious: pct(m.qualified, m.leads) },
    { label: 'Deals', value: m.deals, conversionFromPrevious: pct(m.deals, m.qualified) },
    { label: 'Revenue', value: m.revenue, conversionFromPrevious: pct(m.wonDeals, m.deals) },
  ]
}

export function mockCampaignTimeSeries(
  ctx: RequestContext,
  campaign: Campaign,
  query: CampaignMetricsQuery,
): CampaignTimePoint[] {
  ctx.require('campaigns', 'view')
  const scope = openMetricsScope(ctx)
  const days = eachCalendarDay(query.range) ?? []
  const spend = new Map<string, number>()
  for (const entry of scope.entries) {
    if (entry.campaignId === campaign.id) spend.set(entry.date, (spend.get(entry.date) ?? 0) + entry.amount)
  }
  const leads = new Map<string, number>()
  for (const lead of leadsFor(scope, { campaignId: campaign.id }, query.range)) {
    const day = calendarDayKey(lead.createdAt)
    if (day) leads.set(day, (leads.get(day) ?? 0) + 1)
  }
  return days.map((date) => ({
    date,
    spend: scope.canSpend ? (spend.get(date) ?? 0) : null,
    leads: leads.get(date) ?? 0,
  }))
}

export function mockCampaignBreakdown(
  ctx: RequestContext,
  campaign: Campaign,
  query: CampaignMetricsQuery,
): BreakdownMetricsRow[] {
  ctx.require('campaigns', 'view')
  const scope = openMetricsScope(ctx)
  const adSets = ctx.db.all('adSets').filter((row) => row.campaignId === campaign.id)
  const ads = ctx.db.all('ads').filter((row) => row.campaignId === campaign.id)
  const row = (id: string, name: string, status: Campaign['status'], filter: MetricsFilter, children: BreakdownMetricsRow[]) => ({
    id,
    name,
    status,
    metrics: metricsFor(scope, filter, query.range),
    children,
  })
  const rows = adSets.map((set) =>
    row(
      set.id,
      set.name,
      set.status,
      { campaignId: campaign.id, adSetId: set.id },
      ads
        .filter((ad) => ad.adSetId === set.id)
        .map((ad) => row(ad.id, ad.name, ad.status, { campaignId: campaign.id, adId: ad.id }, [])),
    ),
  )
  const loose: MetricsFilter = { campaignId: campaign.id, unallocated: true }
  const rest: CampaignMetrics = metricsFor(scope, loose, query.range)
  if (rest.leads > 0 || (rest.spend ?? 0) > 0) {
    rows.push({ id: 'unallocated', name: 'Not assigned to an ad set', status: campaign.status, metrics: rest, children: [] })
  }
  return rows
}
