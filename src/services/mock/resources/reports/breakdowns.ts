import { conversionRate, groupBy, groupByDay, percentChange, winRate } from '@/lib/metrics'
import type { BreakdownDimension, BreakdownReport, BreakdownRow, LostAnalysis, WinLossReport } from '@/types'
import { createdIn, inWindow, type ReportScope } from './scope'

function rows(groups: Map<string, unknown[]>, label: (key: string) => string): BreakdownRow[] {
  return [...groups.entries()]
    .map(([key, items]) => ({
      key,
      label: key === 'none' ? 'Unknown' : label(key),
      count: items.length,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export function buildBreakdown(data: ReportScope, dimension: BreakdownDimension): BreakdownReport {
  const leads = createdIn(data.leads, data.query.range)
  const grouped =
    dimension === 'source'
      ? groupBy(leads, (lead) => lead.sourceId)
      : dimension === 'status'
        ? groupBy(leads, (lead) => lead.statusId)
        : dimension === 'campaign'
          ? groupBy(leads, (lead) => lead.campaignId ?? 'none')
          : dimension === 'location'
            ? groupBy(leads, (lead) => lead.location || 'none')
            : groupBy(leads, (lead) => lead.assignedTo ?? 'none')
  const label =
    dimension === 'source'
      ? data.sourceName
      : dimension === 'status'
        ? data.statusName
        : dimension === 'campaign'
          ? data.campaignName
          : dimension === 'salesperson'
            ? data.userName
            : (key: string) => key
  return { dimension, total: leads.length, rows: rows(grouped, label) }
}

function lostLeads(data: ReportScope, range: ReportScope['query']['range']) {
  return data.leads.filter((lead) => data.statusType(lead.statusId) === 'lost' && inWindow(lead.updatedAt, range))
}

function withPercent(list: BreakdownRow[], total: number) {
  return list.map((row) => ({ ...row, percent: conversionRate(row.count, total) ?? 0 }))
}

export function buildWinLoss(data: ReportScope): WinLossReport {
  const range = data.query.range
  const previous = data.previous
  const won = data.deals.filter((deal) => data.stageType(deal.stageId) === 'won' && inWindow(deal.closedAt, range))
  const lost = data.deals.filter((deal) => data.stageType(deal.stageId) === 'lost' && inWindow(deal.closedAt, range))
  const wonBefore = previous
    ? data.deals.filter((deal) => data.stageType(deal.stageId) === 'won' && inWindow(deal.closedAt, previous)).length
    : null
  const lostBefore = previous
    ? data.deals.filter((deal) => data.stageType(deal.stageId) === 'lost' && inWindow(deal.closedAt, previous)).length
    : null
  const compare = Boolean(previous)
  const rate = winRate([
    ...won.map(() => ({ outcome: 'won' as const })),
    ...lost.map(() => ({ outcome: 'lost' as const })),
  ])
  const rateBefore =
    wonBefore === null || lostBefore === null
      ? null
      : winRate([
          ...Array.from({ length: wonBefore }, () => ({ outcome: 'won' as const })),
          ...Array.from({ length: lostBefore }, () => ({ outcome: 'lost' as const })),
        ])
  const reasons = lostLeads(data, range)
  const delta = (current: number, before: number | null) =>
    compare && before !== null ? percentChange(current, before) : null
  return {
    won: { value: won.length, delta: delta(won.length, wonBefore) },
    lost: { value: lost.length, delta: delta(lost.length, lostBefore) },
    winRate: { value: rate ?? 0, delta: rate !== null && rateBefore !== null ? delta(rate, rateBefore) : null },
    reasons: withPercent(rows(groupBy(reasons, (lead) => lead.lostReasonId ?? 'none'), data.reasonName), reasons.length),
  }
}

export function buildLost(data: ReportScope): LostAnalysis {
  const lost = lostLeads(data, data.query.range)
  return {
    total: lost.length,
    reasons: withPercent(rows(groupBy(lost, (lead) => lead.lostReasonId ?? 'none'), data.reasonName), lost.length),
    bySource: rows(groupBy(lost, (lead) => lead.sourceId), data.sourceName),
    bySalesperson: rows(groupBy(lost, (lead) => lead.assignedTo ?? 'none'), data.userName),
    trend: groupByDay(lost, data.query.range, 'updatedAt'),
    previousTrend: data.previous ? groupByDay(lostLeads(data, data.previous), data.previous, 'updatedAt') : null,
  }
}
