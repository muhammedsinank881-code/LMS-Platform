export type BudgetState = 'ok' | 'warning' | 'over'
export const BUDGET_WARNING_PERCENT = 80

export interface BudgetUsage {
  /** Spent as a percentage of budget, uncapped. Null when there is no budget. */
  percent: number | null
  state: BudgetState
}

/** Warning above 80% of budget, over above 100%. */
export function budgetUsage(spent: number, budget: number): BudgetUsage {
  if (!(budget > 0)) return { percent: null, state: 'ok' }
  const percent = (spent / budget) * 100
  if (percent > 100) return { percent, state: 'over' }
  return { percent, state: percent > BUDGET_WARNING_PERCENT ? 'warning' : 'ok' }
}

const DAY_MS = 86_400_000

function dayCount(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS) + 1
}

/**
 * Spend at the end date if the daily rate so far continues. Null without an end date or when the
 * campaign has not started. Once the end date has passed it is simply what was spent.
 */
export function projectSpend(
  spent: number,
  startDate: string,
  endDate: string | null,
  today: Date,
): number | null {
  if (!endDate) return null
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null
  if (today < start) return null
  if (today >= end) return spent
  const elapsed = Math.max(1, dayCount(start, today))
  const total = dayCount(start, end)
  return Math.round((spent / elapsed) * total * 100) / 100
}

export type PacingStatus = 'under' | 'on_track' | 'over'

/** Over when the projection exceeds budget by more than 5%, under when it lands below 85%. */
export function pacingStatus(projected: number | null, budget: number): PacingStatus | null {
  if (projected === null || !(budget > 0)) return null
  const ratio = projected / budget
  if (ratio > 1.05) return 'over'
  return ratio < 0.85 ? 'under' : 'on_track'
}
