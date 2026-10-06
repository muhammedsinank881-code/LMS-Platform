import { matchesAll } from '@/lib/filters'
import { getExtendedLeadFieldValue } from '@/lib/lead-fields'
import type {
  Lead,
  ScoreBreakdownItem,
  ScoreCategory,
  ScoreDecay,
  ScoreResult,
  ScoringRule,
  ScoringThresholds,
} from '@/types'

export const DEFAULT_SCORING_THRESHOLDS: ScoringThresholds = { hot: 70, warm: 40 }
export const DECAY_RULE_ID = 'decay'
const DAY_MS = 86_400_000

export function categoryForScore(
  score: number,
  thresholds: ScoringThresholds = DEFAULT_SCORING_THRESHOLDS,
): ScoreCategory {
  if (score >= thresholds.hot) return 'hot'
  if (score >= thresholds.warm) return 'warm'
  return 'cold'
}

export interface ScoreOptions {
  /** Removes points after a stretch without activity. */
  decay?: ScoreDecay
}

/** Last time anything happened on a lead: an engagement signal, a contact, or its creation. */
export function lastActivityOf(lead: Partial<Lead>): string | null {
  return lead.engagement?.lastActivityAt ?? lead.lastContactedAt ?? lead.createdAt ?? null
}

/** Whether a lead meets every condition of a rule (caps and decay aside). */
export function ruleMatches(rule: Pick<ScoringRule, 'conditions'>, lead: Partial<Lead>, now: Date): boolean {
  return matchesAll(rule.conditions, (field) => getExtendedLeadFieldValue(lead, field, { now }), now)
}

/** How many times a rule's points apply: once, or per signal up to its cap. */
function applications(rule: ScoringRule, lead: Partial<Lead>, now: Date): number {
  const cap = rule.maxApplications
  if (cap === undefined || cap === 'once' || !rule.repeatField) return 1
  const count = Number(getExtendedLeadFieldValue(lead, rule.repeatField, { now }) ?? 0)
  return Math.max(0, Math.min(Number.isFinite(count) ? Math.floor(count) : 0, cap))
}

/**
 * Sums the points of every active rule whose conditions all match, clamped to 0-100.
 * Repeating rules count their signal up to a cap; decay then removes points after inactivity.
 * The breakdown lists each applied rule so the score card can explain the number.
 */
export function calculateLeadScore(
  lead: Partial<Lead>,
  rules: readonly ScoringRule[],
  thresholds: ScoringThresholds = DEFAULT_SCORING_THRESHOLDS,
  now: Date = new Date(),
  options: ScoreOptions = {},
): ScoreResult {
  const breakdown: ScoreBreakdownItem[] = []

  for (const rule of [...rules].sort((a, b) => a.order - b.order)) {
    if (!rule.isActive || rule.points === 0) continue
    if (!ruleMatches(rule, lead, now)) continue
    const times = applications(rule, lead, now)
    if (times > 0) breakdown.push({ rule: { id: rule.id, name: rule.name }, points: rule.points * times })
  }

  const { decay } = options
  if (decay?.enabled && decay.points > 0) {
    const last = lastActivityOf(lead)
    if (last && now.getTime() - Date.parse(last) > decay.afterDays * DAY_MS) {
      breakdown.push({
        rule: { id: DECAY_RULE_ID, name: `No activity for ${decay.afterDays} days` },
        points: -decay.points,
      })
    }
  }

  const raw = breakdown.reduce((sum, item) => sum + item.points, 0)
  const score = Math.min(100, Math.max(0, raw))
  return { score, category: categoryForScore(score, thresholds), breakdown }
}
