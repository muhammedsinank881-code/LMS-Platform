import type { Broadcast, Target, User } from '@/types'
import type { SeedContext } from './context'
import { DAY, int, seedId, type SeedEnv } from './rng'

/** Two finished broadcasts and one scheduled, so the WhatsApp tab has something to show. */
export function buildBroadcasts(env: SeedEnv, ctx: SeedContext): Broadcast[] {
  const template = ctx.config.templates.find((t) => t.channel === 'whatsapp' && t.status === 'approved')
  const sender = ctx.users.find((u) => u.role === 'manager') ?? ctx.users[0]
  if (!template || !sender) return []
  const tags = [...new Set(ctx.leads.flatMap((lead) => lead.tags))].slice(0, 2)
  const variableMap = Object.fromEntries(template.variables.map((name) => [name, name]))

  return tags.map((tag, index): Broadcast => {
    const audience = ctx.leads.filter(
      (lead) => lead.tags.includes(tag) && !lead.archivedAt && !lead.whatsappOptOut && (lead.whatsapp ?? lead.phone),
    )
    const total = audience.length
    const failed = Math.round(total * 0.05)
    const sent = total - failed
    const delivered = sent
    const read = Math.round(sent * 0.6)
    const finished = index === 0
    return {
      id: seedId(env, 'bcast', index + 1),
      tenantId: env.tenantId,
      name: index === 0 ? `Festive offer to ${tag} leads` : `Follow-up for ${tag} leads`,
      templateId: template.id,
      audience: { kind: 'tag', tag },
      audienceLabel: `Tag: ${tag}`,
      variableMap,
      schedule: finished
        ? { mode: 'now', at: null }
        : { mode: 'later', at: new Date(env.now.getTime() + int(env, 1, 3) * DAY).toISOString() },
      status: finished ? 'completed' : 'scheduled',
      stats: finished
        ? { total, sent, delivered, read, replied: Math.round(read * 0.15), failed }
        : { total, sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 },
      excludedOptOut: ctx.leads.filter((lead) => lead.tags.includes(tag) && lead.whatsappOptOut).length,
      pendingLeadIds: finished ? [] : audience.map((lead) => lead.id),
      createdBy: sender.id,
      createdAt: new Date(env.now.getTime() - (finished ? 6 : 1) * DAY).toISOString(),
      completedAt: finished ? new Date(env.now.getTime() - 6 * DAY + 3_600_000).toISOString() : null,
    }
  })
}

/** Monthly targets for this month: one for the team and one per rep. */
export function buildTargets(env: SeedEnv, users: User[]): Target[] {
  const month = env.now.toISOString().slice(0, 7)
  const reps = users.filter((u) => u.role === 'salesperson' || u.role === 'team_leader')
  const perRep = (user: User): Target => ({
    id: seedId(env, 'target', user.id),
    userId: user.id,
    month,
    revenue: int(env, 4, 12) * 100_000,
    dealsWon: int(env, 3, 8),
    leadsContacted: int(env, 25, 50),
  })
  const rows = reps.map(perRep)
  return [
    {
      id: seedId(env, 'target', 'team'),
      userId: null,
      month,
      revenue: rows.reduce((sum, row) => sum + row.revenue, 0),
      dealsWon: rows.reduce((sum, row) => sum + row.dealsWon, 0),
      leadsContacted: rows.reduce((sum, row) => sum + row.leadsContacted, 0),
    },
    ...rows,
  ]
}
