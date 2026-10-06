import { calendarDayKey, eachCalendarDay } from '@/lib/date-range'
import { platformLabel } from '@/lib/campaign-labels'
import { attributionKey, computeMetrics, roundMoney, cac, costPerQualified, cpl, roas } from '@/lib/metrics'
import type {
  Attribution,
  AttributionRow,
  Campaign,
  CampaignReport,
  CampaignReportRow,
  Lead,
  PlatformReportRow,
  SpendEntry,
  SpendRevenuePoint,
} from '@/types'
import type { RequestContext } from '../../core/context'
import { inWindow, type ReportScope } from './scope'

interface Inputs {
  data: ReportScope
  campaigns: Campaign[]
  entries: SpendEntry[]
  canSpend: boolean
  adSets: Array<{ id: string; name: string; campaignId: string }>
  ads: Array<{ id: string; name: string; campaignId: string }>
}

function inputs(ctx: RequestContext, data: ReportScope): Inputs {
  const canSpend = ctx.hasFeature('view-spend')
  const range = data.query.range
  const from = calendarDayKey(range.from) ?? ''
  const to = calendarDayKey(range.to) ?? ''
  return {
    data,
    canSpend,
    campaigns: ctx.db.all('campaigns').filter((c) => !c.archivedAt),
    entries: canSpend ? ctx.db.all('spendEntries').filter((e) => e.date >= from && e.date <= to) : [],
    adSets: ctx.db.all('adSets'),
    ads: ctx.db.all('ads'),
  }
}

function rowFor(
  base: Pick<CampaignReportRow, 'id' | 'name' | 'platform'>,
  input: Inputs,
  leads: Lead[],
  spend: number,
): CampaignReportRow {
  const m = computeMetrics(spend, leads, input.data.deals, input.data.stages)
  const hide = !input.canSpend
  return {
    ...base,
    spend: hide ? null : m.spend,
    leads: m.leads,
    qualified: m.qualified,
    won: m.wonDeals,
    revenue: hide ? null : m.revenue,
    cpl: hide ? null : m.cpl,
    cac: hide ? null : m.cac,
    roas: hide ? null : m.roas,
    costPerQualified: hide ? null : m.costPerQualified,
  }
}

const sum = (entries: SpendEntry[]) => entries.reduce((total, e) => total + e.amount, 0)

function platformRows(rows: CampaignReportRow[], canSpend: boolean): PlatformReportRow[] {
  const groups = new Map<string, CampaignReportRow[]>()
  for (const row of rows) groups.set(row.platform, [...(groups.get(row.platform) ?? []), row])
  return [...groups.entries()].map(([key, items]) => {
    const add = (pick: (r: CampaignReportRow) => number | null) => items.reduce((t, r) => t + (pick(r) ?? 0), 0)
    const spend = add((r) => r.spend)
    const leads = add((r) => r.leads)
    const qualified = add((r) => r.qualified)
    const won = add((r) => r.won)
    const revenue = add((r) => r.revenue)
    return {
      key,
      label: platformLabel(key),
      spend: canSpend ? roundMoney(spend) : null,
      leads,
      qualified,
      won,
      revenue: canSpend ? roundMoney(revenue) : null,
      cpl: canSpend ? cpl(spend, leads) : null,
      cac: canSpend ? cac(spend, won) : null,
      roas: canSpend ? roas(revenue, spend) : null,
      costPerQualified: canSpend ? costPerQualified(spend, qualified) : null,
    }
  })
}

export function buildCampaignReport(ctx: RequestContext, data: ReportScope): CampaignReport {
  const input = inputs(ctx, data)
  const range = data.query.range
  const leads = data.leads.filter((lead) => inWindow(lead.createdAt, range))
  const campaigns = input.campaigns
    .filter((c) => !data.query.campaignId || c.id === data.query.campaignId)
    .map((c) =>
      rowFor(
        { id: c.id, name: c.name, platform: c.platform },
        input,
        leads.filter((lead) => lead.campaignId === c.id),
        sum(input.entries.filter((e) => e.campaignId === c.id)),
      ),
    )
    .filter((row) => row.leads > 0 || (row.spend ?? 0) > 0)
  const platformOf = new Map(input.campaigns.map((c) => [c.id, c.platform]))
  const mix = new Map<string, number>()
  for (const lead of leads) {
    const key = lead.campaignId ? (platformOf.get(lead.campaignId) ?? 'other') : 'direct'
    mix.set(key, (mix.get(key) ?? 0) + 1)
  }
  const scoped = (list: Array<{ id: string; name: string; campaignId: string }>, field: 'adSetId' | 'adId') =>
    list
      .filter((item) => !data.query.campaignId || item.campaignId === data.query.campaignId)
      .map((item) =>
        rowFor(
          { id: item.id, name: item.name, platform: platformOf.get(item.campaignId) ?? 'other' },
          input,
          leads.filter((lead) => lead[field] === item.id),
          sum(input.entries.filter((e) => e[field] === item.id)),
        ),
      )
      .filter((row) => row.leads > 0 || (row.spend ?? 0) > 0)
      .sort((a, b) => b.leads - a.leads)
      .slice(0, data.query.campaignId ? 50 : 10)
  return {
    campaigns,
    platforms: platformRows(campaigns, input.canSpend),
    channelMix: [...mix.entries()]
      .map(([key, count]) => ({ key, label: key === 'direct' ? 'No campaign' : platformLabel(key), count }))
      .sort((a, b) => b.count - a.count),
    adSets: scoped(input.adSets, 'adSetId'),
    ads: scoped(input.ads, 'adId'),
    spendHidden: !input.canSpend,
  }
}

export function buildSpendVsRevenue(ctx: RequestContext, data: ReportScope): SpendRevenuePoint[] {
  const input = inputs(ctx, data)
  const days = eachCalendarDay(data.query.range) ?? []
  const campaignLeads = new Set(
    data.leads.filter((l) => l.campaignId && (!data.query.campaignId || l.campaignId === data.query.campaignId)).map((l) => l.id),
  )
  const spend = new Map<string, number>()
  for (const entry of input.entries) {
    if (data.query.campaignId && entry.campaignId !== data.query.campaignId) continue
    spend.set(entry.date, (spend.get(entry.date) ?? 0) + entry.amount)
  }
  const revenue = new Map<string, number>()
  for (const deal of data.deals) {
    if (data.stageType(deal.stageId) !== 'won' || !deal.closedAt || !campaignLeads.has(deal.leadId)) continue
    const day = calendarDayKey(deal.closedAt)
    if (day) revenue.set(day, (revenue.get(day) ?? 0) + deal.value)
  }
  return days.map((date) => ({
    date,
    spend: input.canSpend ? (spend.get(date) ?? 0) : null,
    revenue: input.canSpend ? (revenue.get(date) ?? 0) : null,
  }))
}

export function buildAttribution(ctx: RequestContext, data: ReportScope, mode: Attribution): AttributionRow[] {
  const platformOf = new Map(ctx.db.all('campaigns').map((c) => [c.id, c.platform as string]))
  const leads = data.leads.filter((lead) => inWindow(lead.createdAt, data.query.range))
  const wonByLead = new Map<string, number>()
  for (const deal of data.deals) {
    if (data.stageType(deal.stageId) === 'won') wonByLead.set(deal.leadId, (wonByLead.get(deal.leadId) ?? 0) + deal.value)
  }
  const rows = new Map<string, AttributionRow>()
  for (const lead of leads) {
    const key = attributionKey(lead, mode, (id) => platformOf.get(id) ?? null)
    const label = platformOf.size > 0 && [...platformOf.values()].includes(key) ? platformLabel(key) : data.sourceName(key)
    const row = rows.get(key) ?? { key, label, leads: 0, won: 0, revenue: 0 }
    row.leads += 1
    if (data.statusType(lead.statusId) === 'won') row.won += 1
    row.revenue += wonByLead.get(lead.id) ?? 0
    rows.set(key, row)
  }
  return [...rows.values()].sort((a, b) => b.leads - a.leads)
}
