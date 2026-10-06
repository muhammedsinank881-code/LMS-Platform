import { computePipelineValue, conversionRate, percentChange } from '@/lib/metrics'
import type { DashboardSummary, DateRange, Deal, Kpi, Lead } from '@/types'
import { createdIn, dealWasOpen, inWindow, leadWasOpen, type ReportScope } from './scope'

function kpi(value: number, previous: number | null, compare: boolean): Kpi {
  return { value, delta: compare && previous !== null ? percentChange(value, previous) : null }
}

function pipelineAt(deals: readonly Deal[], at: number) {
  const open = deals.filter((deal) => dealWasOpen(deal, at))
  return {
    count: open.length,
    total: open.reduce((sum, deal) => sum + deal.value, 0),
    weighted: open.reduce((sum, deal) => sum + (deal.value * deal.probability) / 100, 0),
  }
}

function closed(data: ReportScope, type: 'won' | 'lost', range: DateRange): Deal[] {
  return data.deals.filter((deal) => data.stageType(deal.stageId) === type && inWindow(deal.closedAt, range))
}

function qualified(leads: readonly Lead[]): number {
  return leads.filter((lead) => lead.qualificationStatus === 'qualified').length
}

function wonLeads(data: ReportScope, leads: readonly Lead[]): number {
  return leads.filter((lead) => data.statusType(lead.statusId) === 'won').length
}

function hotAt(data: ReportScope, at: number): number {
  return data.leads.filter((lead) => lead.scoreCategory === 'hot' && leadWasOpen(lead, data.statusType, at)).length
}

export function buildSummary(data: ReportScope, now: number): DashboardSummary {
  const { range } = data.query
  const compare = Boolean(data.query.compare && data.previous)
  const previous = data.previous
  const currentLeads = createdIn(data.leads, range)
  const earlierLeads = previous ? createdIn(data.leads, previous) : []
  const end = Date.parse(range.to)
  const prevEnd = previous ? Date.parse(previous.to) : null
  const wonNow = closed(data, 'won', range)
  const wonBefore = previous ? closed(data, 'won', previous) : []
  const lostNow = closed(data, 'lost', range)
  const lostBefore = previous ? closed(data, 'lost', previous) : []
  const value = (deals: readonly Deal[]) => deals.reduce((sum, deal) => sum + deal.value, 0)
  const nowPipeline = computePipelineValue(data.deals, data.stages)
  const thenPipeline = prevEnd === null ? null : pipelineAt(data.deals, prevEnd)

  return {
    range,
    totalLeads: kpi(
      data.leads.filter((lead) => Date.parse(lead.createdAt) <= end).length,
      prevEnd === null ? null : data.leads.filter((lead) => Date.parse(lead.createdAt) <= prevEnd).length,
      compare,
    ),
    openLeads: kpi(
      data.leads.filter((lead) => leadWasOpen(lead, data.statusType, now)).length,
      prevEnd === null ? null : data.leads.filter((lead) => leadWasOpen(lead, data.statusType, prevEnd)).length,
      compare,
    ),
    newLeads: kpi(currentLeads.length, previous ? earlierLeads.length : null, compare),
    qualified: kpi(qualified(currentLeads), previous ? qualified(earlierLeads) : null, compare),
    hotLeads: kpi(hotAt(data, now), prevEnd === null ? null : hotAt(data, prevEnd), compare),
    openDeals: kpi(nowPipeline.count, thenPipeline?.count ?? null, compare),
    won: kpi(wonNow.length, previous ? wonBefore.length : null, compare),
    lost: kpi(lostNow.length, previous ? lostBefore.length : null, compare),
    pipelineValue: kpi(nowPipeline.total, thenPipeline?.total ?? null, compare),
    weightedPipeline: kpi(nowPipeline.weighted, thenPipeline?.weighted ?? null, compare),
    revenue: kpi(value(wonNow), previous ? value(wonBefore) : null, compare),
    conversionRate: kpi(
      conversionRate(wonLeads(data, currentLeads), currentLeads.length) ?? 0,
      previous ? conversionRate(wonLeads(data, earlierLeads), earlierLeads.length) : null,
      compare,
    ),
  }
}
