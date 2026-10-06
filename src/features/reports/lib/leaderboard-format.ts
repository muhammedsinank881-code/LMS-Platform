import { formatMinutes, formatPercent } from '@/features/dashboard/lib/format-metric'
import { formatINR } from '@/lib/format'
import type { LeaderboardMetric } from '@/types'

export const LEADERBOARD_LABELS: Record<LeaderboardMetric, string> = {
  revenue: 'Revenue',
  won: 'Deals won',
  conversion: 'Conversion',
  speed: 'Response speed',
}

export function formatLeaderboardValue(metric: LeaderboardMetric, value: number): string {
  if (metric === 'revenue') return formatINR(value)
  if (metric === 'conversion') return formatPercent(value)
  if (metric === 'speed') return formatMinutes(value)
  return String(value)
}
