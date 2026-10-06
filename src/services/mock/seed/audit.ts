import type { AuditAction, AuditEntity, AuditLog, AuditValue } from '@/types'
import type { SeedContext, SeedSales } from './context'
import { DEVICES, IP_ADDRESSES } from './indian-data'
import { DAY, HOUR, int, pick, scaled, seedId, weighted, type SeedEnv } from './rng'

type Entry = Pick<
  AuditLog,
  'action' | 'entity' | 'entityId' | 'entityLabel' | 'previousValue' | 'newValue'
> & { userId?: string }

const ACTION_WEIGHTS: Array<{ value: AuditAction; weight: number }> = [
  { value: 'status_changed', weight: 30 },
  { value: 'assigned', weight: 14 },
  { value: 'created', weight: 12 },
  { value: 'updated', weight: 12 },
  { value: 'stage_moved', weight: 8 },
  { value: 'login', weight: 7 },
  { value: 'converted', weight: 4 },
  { value: 'exported', weight: 3 },
  { value: 'imported', weight: 2 },
  { value: 'merged', weight: 2 },
  { value: 'settings_changed', weight: 4 },
  { value: 'deleted', weight: 2 },
]

/** About 100 audit entries over the last 30 days, shaped like what the real app will write. */
export function buildAuditLogs(env: SeedEnv, ctx: SeedContext, sales: SeedSales): AuditLog[] {
  const { leads, users, config } = ctx
  const statusName = (id: string) => config.statuses.find((s) => s.id === id)?.name ?? id
  const stageName = (id: string) => config.stages.find((s) => s.id === id)?.name ?? id
  const userName = (id: string | null) => users.find((u) => u.id === id)?.name ?? 'Unassigned'
  const admins = users.filter((u) => u.role === 'super_admin' || u.role === 'admin')
  const owners = users.filter((u) => u.role !== 'super_admin')

  const entryFor = (action: AuditAction): Entry => {
    const lead = pick(env, leads)
    const leadRef = { entity: 'lead' as AuditEntity, entityId: lead.id, entityLabel: lead.name }
    switch (action) {
      case 'status_changed': {
        const [from, to] = [pick(env, config.statuses), pick(env, config.statuses)]
        return {
          action,
          ...leadRef,
          previousValue: { status: from.name },
          newValue: { status: to.name },
        }
      }
      case 'assigned':
        return {
          action,
          ...leadRef,
          previousValue: { assignedTo: userName(pick(env, owners).id) },
          newValue: { assignedTo: userName(lead.assignedTo) },
        }
      case 'stage_moved': {
        const deal = sales.deals.length > 0 ? pick(env, sales.deals) : null
        if (!deal)
          return {
            action: 'updated',
            ...leadRef,
            previousValue: { score: 40 },
            newValue: { score: lead.score },
          }
        const [from, to] = [pick(env, config.stages), stageName(deal.stageId)]
        return {
          action,
          entity: 'deal',
          entityId: deal.id,
          entityLabel: deal.title,
          previousValue: { stage: from.name },
          newValue: { stage: to },
        }
      }
      case 'converted': {
        const customer = sales.customers.length > 0 ? pick(env, sales.customers) : null
        return {
          action,
          entity: 'customer',
          entityId: customer?.id ?? lead.id,
          entityLabel: customer?.name ?? lead.name,
          previousValue: { status: statusName(lead.statusId) },
          newValue: { customer: customer?.id ?? null },
        }
      }
      case 'created':
        return {
          action,
          ...leadRef,
          previousValue: null,
          newValue: { source: lead.sourceId, name: lead.name },
        }
      case 'updated': {
        const changes: AuditValue[] = [
          { budget: lead.budget },
          { priority: lead.priority },
          { tags: lead.tags },
          { location: lead.location },
        ]
        return {
          action,
          ...leadRef,
          previousValue: { budget: 50_000 },
          newValue: pick(env, changes),
        }
      }
      case 'merged':
        return { action, ...leadRef, previousValue: { duplicates: 2 }, newValue: { duplicates: 1 } }
      case 'deleted':
        return { action, ...leadRef, previousValue: { name: lead.name }, newValue: null }
      case 'exported':
        return {
          action,
          entity: 'lead',
          entityId: 'bulk',
          entityLabel: 'Leads export',
          previousValue: null,
          newValue: { rows: int(env, 20, 180) },
        }
      case 'imported':
        return {
          action,
          entity: 'lead',
          entityId: 'bulk',
          entityLabel: 'Leads import',
          previousValue: null,
          newValue: { rows: int(env, 30, 120) },
        }
      case 'settings_changed': {
        const rule = pick(env, config.scoringRules)
        return {
          action,
          entity: 'setting',
          entityId: rule.id,
          entityLabel: rule.name,
          previousValue: { points: rule.points - 5 },
          newValue: { points: rule.points },
          userId: pick(env, admins).id,
        }
      }
      case 'login': {
        const user = pick(env, users)
        return {
          action,
          entity: 'user',
          entityId: user.id,
          entityLabel: user.name,
          previousValue: null,
          newValue: null,
          userId: user.id,
        }
      }
    }
  }

  const total = scaled(env, 100, 12)
  const rows = Array.from({ length: total }, () => ({
    entry: entryFor(weighted(env, ACTION_WEIGHTS)),
    at: env.now.getTime() - int(env, HOUR, 30 * DAY),
  })).sort((a, b) => a.at - b.at)

  return rows.map(({ entry, at }, index): AuditLog => {
    const { userId, ...fields } = entry
    return {
      ...fields,
      id: seedId(env, 'audit', index + 1),
      tenantId: env.tenantId,
      userId: userId ?? pick(env, owners).id,
      ip: pick(env, IP_ADDRESSES),
      device: pick(env, DEVICES),
      createdAt: new Date(at).toISOString(),
    }
  })
}
