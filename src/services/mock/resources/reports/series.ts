import { calendarDayKey, eachCalendarDay } from '@/lib/date-range'
import { conversionRate, groupByDay, summarizeDeals } from '@/lib/metrics'
import type { CountSeries, DateRange, FunnelStage, RevenuePoint, RevenueSeries } from '@/types'
import { createdIn, inWindow, type ReportScope } from './scope'

function revenueByDay(data: ReportScope, range: DateRange): RevenuePoint[] {
  const days = eachCalendarDay(range) ?? []
  const totals = new Map(days.map((day) => [day, 0]))
  for (const deal of data.deals) {
    if (data.stageType(deal.stageId) !== 'won' || !inWindow(deal.closedAt, range) || !deal.closedAt) continue
    const key = calendarDayKey(deal.closedAt)
    if (key && totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + deal.value)
  }
  return days.map((date) => ({ date, revenue: totals.get(date) ?? 0 }))
}

export function buildLeadsOverTime(data: ReportScope): CountSeries {
  const range = data.query.range
  return {
    points: groupByDay(createdIn(data.leads, range), range, 'createdAt'),
    previous: data.previous ? groupByDay(createdIn(data.leads, data.previous), data.previous, 'createdAt') : null,
  }
}

export function buildRevenueOverTime(data: ReportScope): RevenueSeries {
  return {
    points: revenueByDay(data, data.query.range),
    previous: data.previous ? revenueByDay(data, data.previous) : null,
  }
}

export function buildFunnel(data: ReportScope): FunnelStage[] {
  const stages = data.stages.filter((stage) => stage.type !== 'invalid')
  let previousCount: number | null = null
  return stages.map((stage) => {
    const inStage = data.deals.filter((deal) => deal.stageId === stage.id)
    const count = inStage.length
    const row: FunnelStage = {
      stageId: stage.id,
      name: stage.name,
      count,
      value: inStage.reduce((sum, deal) => sum + deal.value, 0),
      conversionFromPrevious: previousCount === null ? null : conversionRate(count, previousCount),
    }
    previousCount = count
    return row
  })
}

export function buildPipeline(data: ReportScope) {
  return summarizeDeals(data.deals, data.stages)
}
