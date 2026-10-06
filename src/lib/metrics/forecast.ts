import { calendarDayKey } from '@/lib/date-range'
import type { ForecastMonth } from '@/types'

/** Deals at or above this probability are "commit". */
export const COMMIT_MIN_PROBABILITY = 75
/** Deals at or above this probability count towards the best case. */
export const BEST_MIN_PROBABILITY = 50

export interface ForecastDeal {
  value: number
  /** 0 to 100. */
  probability: number
  expectedCloseDate: string
}

const round = (n: number) => Math.round(n * 100) / 100

/**
 * Rule-based ranges per expected close month, from stage probabilities.
 * - weighted: every deal at value x probability
 * - worst: commit deals only, at value x probability
 * - commit: commit deals at full value
 * - best: every deal at or above 50% at full value
 * so worst <= commit <= best.
 */
export function forecastRanges(deals: readonly ForecastDeal[]): ForecastMonth[] {
  const months = new Map<string, ForecastMonth>()
  for (const deal of deals) {
    const day = calendarDayKey(deal.expectedCloseDate)
    if (!day || !(deal.value > 0)) continue
    const month = day.slice(0, 7)
    const row = months.get(month) ?? { month, weighted: 0, worst: 0, commit: 0, best: 0, deals: 0 }
    const weighted = (deal.value * deal.probability) / 100
    row.deals += 1
    row.weighted += weighted
    if (deal.probability >= COMMIT_MIN_PROBABILITY) {
      row.worst += weighted
      row.commit += deal.value
    }
    if (deal.probability >= BEST_MIN_PROBABILITY) row.best += deal.value
    months.set(month, row)
  }
  return [...months.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((row) => ({ ...row, weighted: round(row.weighted), worst: round(row.worst) }))
}
