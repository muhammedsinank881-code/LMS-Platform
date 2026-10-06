import type { AssignmentFallback, AssignmentRule, Lead, Role, User } from '@/types'
import { matchesAll } from './filters'
import { getLeadFieldValue } from './lead-fields'

/** Roles that own leads by default. Admins and managers only receive them via an explicit pool. */
const DEFAULT_ASSIGNABLE_ROLES: readonly Role[] = ['salesperson', 'team_leader']

export interface AssignmentResult {
  userId: string | null
  /** The rule that decided, or null when nothing matched. */
  ruleId: string | null
  reason: string
}

type LeadForAssignment = Partial<Lead>
type AssigneeCandidate = Pick<
  User,
  'id' | 'role' | 'teamId' | 'language' | 'location' | 'workload' | 'status'
>

function sameText(a: string | null | undefined, b: string | null | undefined): boolean {
  return Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase())
}

function eligibleUsers(
  rule: AssignmentRule,
  lead: LeadForAssignment,
  users: readonly AssigneeCandidate[],
): AssigneeCandidate[] {
  const { userIds, teamId, matchLanguage, matchLocation } = rule.pool
  return users.filter((user) => {
    if (user.status !== 'active') return false
    if (
      userIds.length > 0
        ? !userIds.includes(user.id)
        : !DEFAULT_ASSIGNABLE_ROLES.includes(user.role)
    )
      return false
    if (teamId && user.teamId !== teamId) return false
    if (matchLanguage && lead.language && !sameText(user.language, lead.language)) return false
    if (matchLocation && lead.location && !sameText(user.location, lead.location)) return false
    return true
  })
}

/** ISO time of the user's most recent assignment; '' if they have never been assigned. */
function lastAssignedAt(userId: string, leads: readonly Lead[]): string {
  let latest = ''
  for (const lead of leads) {
    if (lead.assignedTo === userId && lead.assignedAt && lead.assignedAt > latest) {
      latest = lead.assignedAt
    }
  }
  return latest
}

function leastRecentlyAssigned(
  pool: readonly AssigneeCandidate[],
  leads: readonly Lead[],
): AssigneeCandidate {
  return [...pool].sort(
    (a, b) =>
      lastAssignedAt(a.id, leads).localeCompare(lastAssignedAt(b.id, leads)) ||
      a.id.localeCompare(b.id),
  )[0]
}

function averageScore(userId: string, leads: readonly Lead[]): number {
  const owned = leads.filter((lead) => lead.assignedTo === userId && !lead.archivedAt)
  if (owned.length === 0) return 0
  return owned.reduce((sum, lead) => sum + lead.score, 0) / owned.length
}

function highestScore(
  pool: readonly AssigneeCandidate[],
  leads: readonly Lead[],
): AssigneeCandidate {
  return [...pool].sort(
    (a, b) =>
      averageScore(b.id, leads) - averageScore(a.id, leads) ||
      a.workload - b.workload ||
      a.id.localeCompare(b.id),
  )[0]
}

function leastLoaded(
  pool: readonly AssigneeCandidate[],
  leads: readonly Lead[],
): AssigneeCandidate {
  return [...pool].sort(
    (a, b) =>
      a.workload - b.workload ||
      lastAssignedAt(a.id, leads).localeCompare(lastAssignedAt(b.id, leads)) ||
      a.id.localeCompare(b.id),
  )[0]
}

/**
 * Picks the owner for a lead. Active rules are tried in priority order (lowest first); the first
 * rule whose conditions match and whose pool is not empty decides.
 *
 * - `round_robin`: the eligible user who was assigned a lead longest ago (never-assigned first).
 * - `workload`: the eligible user with the fewest open leads (`user.workload`).
 * - `specific_user`: the first user listed in the rule's pool.
 * - `highest_score`: the eligible user whose open leads have the highest average score.
 * - `manual`: leaves the lead unassigned for a person to route.
 * - `fallback`, when passed, is used only if no rule matches.
 */
export function pickAssignee(
  lead: LeadForAssignment,
  rules: readonly AssignmentRule[],
  users: readonly AssigneeCandidate[],
  leads: readonly Lead[],
  now: Date = new Date(),
  fallback?: AssignmentFallback | null,
): AssignmentResult {
  const teamOf = (userId: string) => users.find((user) => user.id === userId)?.teamId ?? null
  const context = { now, teamOf }

  const ordered = rules.filter((rule) => rule.isActive).sort((a, b) => a.priority - b.priority)
  for (const rule of ordered) {
    const matches = matchesAll(
      rule.conditions,
      (field) => getLeadFieldValue(lead, field, context),
      now,
    )
    if (!matches) continue

    if (rule.distribution === 'manual') {
      return { userId: null, ruleId: rule.id, reason: `"${rule.name}" requires manual assignment` }
    }

    const pool = eligibleUsers(rule, lead, users)
    if (pool.length === 0) continue

    let chosen: AssigneeCandidate
    if (rule.distribution === 'specific_user') {
      const wanted = rule.pool.userIds.find((id) => pool.some((user) => user.id === id))
      chosen = pool.find((user) => user.id === wanted) ?? pool[0]
    } else if (rule.distribution === 'workload') {
      chosen = leastLoaded(pool, leads)
    } else if (rule.distribution === 'highest_score') {
      chosen = highestScore(pool, leads)
    } else {
      chosen = leastRecentlyAssigned(pool, leads)
    }
    return {
      userId: chosen.id,
      ruleId: rule.id,
      reason: `Matched "${rule.name}" (${rule.distribution})`,
    }
  }

  if (fallback?.userId) {
    return { userId: fallback.userId, ruleId: null, reason: 'Fallback assignee' }
  }
  return { userId: null, ruleId: null, reason: 'No assignment rule matched' }
}
