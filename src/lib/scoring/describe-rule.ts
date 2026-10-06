import { describeCondition } from '@/lib/automation/conditions'
import { idLookups, type Lookups } from '@/lib/automation/lookups'
import type { ScoringRule } from '@/types'

export const formatPoints = (points: number) => `${points > 0 ? '+' : ''}${points}`

/** "Budget greater than 1,00,000: +20". Repeating rules say how often they apply. */
export function describeScoringRule(
  rule: Pick<ScoringRule, 'conditions' | 'points' | 'maxApplications' | 'repeatField'>,
  lookups: Lookups = idLookups,
): string {
  const when = rule.conditions.length
    ? rule.conditions.map((c) => describeCondition(c, lookups)).join(' and ')
    : 'Every lead'
  const repeat =
    typeof rule.maxApplications === 'number' && rule.repeatField
      ? ` (each time, up to ${rule.maxApplications}×)`
      : ''
  return `${when}: ${formatPoints(rule.points)}${repeat}`
}
