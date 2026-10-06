import type { ScoreDecay, ScoringThresholds } from '@/types'

export interface ScoringDraft {
  thresholds: ScoringThresholds
  decay: ScoreDecay
}

export function validateDraft({ thresholds, decay }: ScoringDraft): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!(thresholds.hot <= 100 && thresholds.warm >= 0 && thresholds.warm < thresholds.hot)) {
    errors.thresholds = 'Warm must be lower than hot, both between 0 and 100.'
  }
  if (!Number.isInteger(decay.afterDays) || decay.afterDays < 1 || decay.afterDays > 365) errors.afterDays = 'Enter 1 to 365 days.'
  if (!Number.isInteger(decay.points) || decay.points < 1 || decay.points > 100) errors.points = 'Enter 1 to 100 points.'
  return errors
}
