import type { CampaignMetrics } from '@/types'

export const HIGH_CPL_FACTOR = 1.5
export const MIN_ROAS = 1

export interface PerformanceFlag {
  code: 'high_cpl' | 'low_roas'
  /** Plain-language reason, shown in the tooltip. */
  reason: string
}

/** Underperformer flags. Nothing is flagged without spend, and hidden spend flags nothing. */
export function underperformerFlags(
  metrics: Pick<CampaignMetrics, 'spend' | 'cpl' | 'roas'>,
  tenantAvgCpl: number | null,
): PerformanceFlag[] {
  if (metrics.spend === null || metrics.spend <= 0) return []
  const flags: PerformanceFlag[] = []
  if (metrics.cpl !== null && tenantAvgCpl !== null && metrics.cpl > tenantAvgCpl * HIGH_CPL_FACTOR) {
    flags.push({
      code: 'high_cpl',
      reason: `Cost per lead is more than ${HIGH_CPL_FACTOR}x the workspace average.`,
    })
  }
  if (metrics.roas !== null && metrics.roas < MIN_ROAS) {
    flags.push({ code: 'low_roas', reason: 'Return on ad spend is below 1: revenue is less than spend.' })
  }
  return flags
}
