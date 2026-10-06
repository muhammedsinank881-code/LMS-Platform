import type { Lead, User } from '@/types'

const SELLING_ROLES: ReadonlySet<string> = new Set(['salesperson', 'team_leader'])

/**
 * The next owner in a plain rotation: among active sellers, whoever was assigned a lead longest
 * ago (never-assigned first). Ties break on id so the result is stable.
 */
export function pickRoundRobin(
  users: readonly Pick<User, 'id' | 'role' | 'status'>[],
  leads: readonly Pick<Lead, 'assignedTo' | 'assignedAt'>[],
): string | null {
  const pool = users.filter((user) => user.status === 'active' && SELLING_ROLES.has(user.role))
  const last = (id: string) =>
    leads.reduce((latest, lead) => (lead.assignedTo === id && lead.assignedAt && lead.assignedAt > latest ? lead.assignedAt : latest), '')
  const [next] = [...pool].sort((a, b) => last(a.id).localeCompare(last(b.id)) || a.id.localeCompare(b.id))
  return next?.id ?? null
}
