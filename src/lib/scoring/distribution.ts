import type { Lead, ScoreCategory, ScoringThresholds } from '@/types'
import { categoryForScore } from './calculate'

export type ScoreDistribution = Record<ScoreCategory, number> & { total: number }

/** How many leads fall in each category under the given thresholds. */
export function scoreDistribution(
  leads: ReadonlyArray<Pick<Lead, 'score'>>,
  thresholds: ScoringThresholds,
): ScoreDistribution {
  const out: ScoreDistribution = { hot: 0, warm: 0, cold: 0, total: leads.length }
  for (const lead of leads) out[categoryForScore(lead.score, thresholds)] += 1
  return out
}
