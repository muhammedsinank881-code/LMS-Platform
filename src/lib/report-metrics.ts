import { eachCalendarDay, calendarDayKey, REPORT_TIME_ZONE } from '@/lib/date-range'
import type { DateRange, SalesPerformanceRow, SeriesGranularity, TimeSeriesPoint } from '@/types'

/** The equal-length window that ends 1 ms before `range.from`. Null when the range is empty or invalid. */
export function previousPeriod(range: DateRange): DateRange | null {
  const start = Date.parse(range.from)
  const end = Date.parse(range.to)
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null
  const span = end - start
  const prevEnd = start - 1
  return { from: new Date(prevEnd - span).toISOString(), to: new Date(prevEnd).toISOString() }
}

/** Percent change versus the previous value. Null when the previous value is 0 or either side is not finite. */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null
  return ((current - previous) / previous) * 100
}

/** `won / total` as a percentage. Null when there is nothing to divide by. */
export function conversionRate(won: number, total: number): number | null {
  if (!Number.isFinite(won) || !Number.isFinite(total) || total <= 0) return null
  return (won / total) * 100
}

/**
 * One point per calendar day in `range`, in `timeZone`. Days with no items are 0.
 * An instant just before midnight UTC still lands on the next local day when the zone is ahead of UTC.
 */
export function groupByDay<T extends object>(
  items: readonly T[],
  range: DateRange,
  dateField: keyof T,
  timeZone = REPORT_TIME_ZONE,
): TimeSeriesPoint[] {
  const days = eachCalendarDay(range, timeZone)
  if (!days || days.length === 0) return []
  const first = days[0] ?? ''
  const last = days[days.length - 1] ?? ''
  const counts = new Map<string, number>()
  for (const item of items) {
    const raw = item[dateField]
    if (typeof raw !== 'string') continue
    const key = calendarDayKey(raw, timeZone)
    if (!key || key < first || key > last) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return days.map((date) => ({ date, count: counts.get(date) ?? 0 }))
}

export function groupBy<T>(items: readonly T[], key: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const name = key(item)
    const list = groups.get(name)
    if (list) list.push(item)
    else groups.set(name, [item])
  }
  return groups
}

export function averageResponseTime(
  leads: readonly { firstResponseTimeMins: number | null }[],
): number | null {
  const values = leads
    .map((lead) => lead.firstResponseTimeMins)
    .filter((value): value is number => value !== null && Number.isFinite(value))
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export type DealOutcome = 'won' | 'lost' | 'open'

/** Won / (won + lost), as a percentage. Open deals are ignored. Null when nothing has closed. */
export function winRate(deals: readonly { outcome: DealOutcome }[]): number | null {
  let won = 0
  let lost = 0
  for (const deal of deals) {
    if (deal.outcome === 'won') won += 1
    else if (deal.outcome === 'lost') lost += 1
  }
  return conversionRate(won, won + lost)
}

export function followUpCompletionRate(followUps: readonly { status: string }[]): number | null {
  if (followUps.length === 0) return null
  return conversionRate(followUps.filter((item) => item.status === 'done').length, followUps.length)
}

export function avgDealValue(deals: readonly { value: number }[]): number | null {
  if (deals.length === 0) return null
  return deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length
}

function bucketKey(date: string, granularity: SeriesGranularity): string {
  if (granularity !== 'week') return granularity === 'month' ? date.slice(0, 7) : date
  const [year, month, day] = date.split('-').map(Number)
  const utc = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1))
  const weekday = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() - (weekday - 1))
  return utc.toISOString().slice(0, 10)
}

/** Sums a daily series into weeks (Monday) or months. Day leaves the points unchanged. */
export function groupSeries<T extends { date: string }>(
  points: readonly T[],
  granularity: SeriesGranularity,
  valueOf: (point: T) => number,
  build: (date: string, value: number, sample: T) => T,
): T[] {
  if (granularity === 'day') return points.map((point) => ({ ...point }))
  const order: string[] = []
  const totals = new Map<string, { value: number; sample: T }>()
  for (const point of points) {
    const key = bucketKey(point.date, granularity)
    const existing = totals.get(key)
    if (existing) existing.value += valueOf(point)
    else {
      order.push(key)
      totals.set(key, { value: valueOf(point), sample: point })
    }
  }
  return order.map((key) => {
    const row = totals.get(key)
    return build(key, row?.value ?? 0, row?.sample ?? points[0])
  })
}

function weighted(
  rows: readonly SalesPerformanceRow[],
  rate: (row: SalesPerformanceRow) => number | null,
  weight: (row: SalesPerformanceRow) => number,
): number | null {
  let numerator = 0
  let denominator = 0
  for (const row of rows) {
    const value = rate(row)
    const share = weight(row)
    if (value === null || share <= 0) continue
    numerator += value * share
    denominator += share
  }
  return denominator > 0 ? numerator / denominator : null
}

/** Additive columns are sums. Rates are weighted so the total matches the rows it came from. */
export function sumPerformance(rows: readonly SalesPerformanceRow[]): SalesPerformanceRow {
  const sum = (pick: (row: SalesPerformanceRow) => number) => rows.reduce((total, row) => total + pick(row), 0)
  return {
    userId: 'total',
    name: 'Total',
    leadsAssigned: sum((row) => row.leadsAssigned),
    leadsContacted: sum((row) => row.leadsContacted),
    followUpsDone: sum((row) => row.followUpsDone),
    qualified: sum((row) => row.qualified),
    proposals: sum((row) => row.proposals),
    won: sum((row) => row.won),
    lost: sum((row) => row.lost),
    revenue: sum((row) => row.revenue),
    conversionRate: weighted(rows, (row) => row.conversionRate, (row) => row.leadsAssigned),
    avgResponseTimeMins: weighted(rows, (row) => row.avgResponseTimeMins, (row) => row.leadsContacted),
  }
}
