import type { PaceStatus, TargetMetric, TargetProgressRow } from '@/types'

/** Share of the month that has passed, 0 to 1. Past months are 1, future months 0. */
export function monthElapsed(month: string, now: Date): number {
  const [year, mon] = month.split('-').map(Number)
  if (!year || !mon) return 0
  const start = Date.UTC(year, mon - 1, 1)
  const end = Date.UTC(year, mon, 1)
  const fraction = (now.getTime() - start) / (end - start)
  return Math.min(1, Math.max(0, fraction))
}

/** Actual as a percentage of target, uncapped. Null when there is no target. */
export function targetPercent(actual: number, target: number): number | null {
  return target > 0 && Number.isFinite(actual) ? (actual / target) * 100 : null
}

/**
 * Ahead when at least 10% over the straight-line pace, behind when more than 10% under it.
 * Before the month starts there is no pace to compare against.
 */
export function paceStatus(percent: number | null, elapsed: number): PaceStatus | null {
  if (percent === null) return null
  if (elapsed <= 0) return 'on_track'
  const ratio = percent / (elapsed * 100)
  if (ratio >= 1.1) return 'ahead'
  return ratio >= 0.9 ? 'on_track' : 'behind'
}

export function buildTargetRows(
  targets: Record<TargetMetric, number>,
  actuals: Record<TargetMetric, number>,
  month: string,
  now: Date,
): TargetProgressRow[] {
  const elapsed = monthElapsed(month, now)
  return (Object.keys(targets) as TargetMetric[]).map((metric) => {
    const percent = targetPercent(actuals[metric], targets[metric])
    return {
      metric,
      target: targets[metric],
      actual: actuals[metric],
      percent,
      pace: paceStatus(percent, elapsed),
    }
  })
}
