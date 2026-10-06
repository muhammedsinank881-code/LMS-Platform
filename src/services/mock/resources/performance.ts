import { buildTargetRows } from '@/lib/metrics'
import type { PerformanceApiClient } from '@/services/api/performance'
import type { Target, TargetMetric, TargetProgress } from '@/types'
import { request, type RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import { buildLeaderboard, buildRepDetail, buildTeam } from './performance-team'

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

function targetsOf(ctx: RequestContext): Target[] {
  return ctx.db.find('tenantSettings', ctx.tenantId)?.targets ?? []
}

function writeTargets(ctx: RequestContext, targets: Target[]): void {
  const settings = ctx.db.get('tenantSettings', ctx.tenantId, 'Workspace')
  ctx.db.save('tenantSettings', { ...settings, targets })
}

/** Targets the caller may see: reps see their own, wider scopes see everyone's and the team's. */
function visibleTargets(ctx: RequestContext, month: string): Target[] {
  ctx.require('reports', 'view')
  const scope = ctx.scopeFor('reports')
  return targetsOf(ctx).filter((target) => {
    if (target.month !== month) return false
    if (target.userId === null) return scope !== 'own'
    return ctx.inScope('reports', target.userId)
  })
}

function monthWindow(month: string): { from: number; to: number } {
  const [year, mon] = month.split('-').map(Number)
  return { from: Date.UTC(year ?? 1970, (mon ?? 1) - 1, 1), to: Date.UTC(year ?? 1970, mon ?? 1, 1) }
}

function actualsFor(ctx: RequestContext, month: string, userId: string | null): Record<TargetMetric, number> {
  const { from, to } = monthWindow(month)
  const within = (iso: string | null) => iso !== null && Date.parse(iso) >= from && Date.parse(iso) < to
  const mine = (owner: string | null) => (userId === null ? ctx.inScope('reports', owner) : owner === userId)
  const wonStages = new Set(ctx.db.all('stages').filter((s) => s.type === 'won').map((s) => s.id))
  const won = ctx.db.all('deals').filter((d) => mine(d.ownerId) && wonStages.has(d.stageId) && within(d.closedAt))
  const contacted = ctx.db.all('leads').filter((l) => !l.archivedAt && mine(l.assignedTo) && within(l.lastContactedAt))
  return {
    revenue: won.reduce((sum, deal) => sum + deal.value, 0),
    dealsWon: won.length,
    leadsContacted: contacted.length,
  }
}

export const mockPerformanceApi: PerformanceApiClient = {
  team: (query) => request((ctx) => buildTeam(ctx, query)),
  repDetail: (userId, query) => request((ctx) => buildRepDetail(ctx, userId, query)),
  leaderboard: (query, metric) => request((ctx) => buildLeaderboard(ctx, query, metric)),
  listTargets: (month) => request((ctx) => visibleTargets(ctx, month)),
  saveTarget: (input) =>
    request((ctx) => {
      ctx.require('reports', 'view')
      ctx.requireFeature('manage-targets')
      if (!MONTH.test(input.month)) throw validationError('month', 'Pick a month.')
      for (const field of ['revenue', 'dealsWon', 'leadsContacted'] as const) {
        if (!(input[field] >= 0)) throw validationError(field, 'Enter zero or more.')
      }
      if (input.userId !== null && !ctx.db.find('users', input.userId)) {
        throw validationError('userId', 'Pick someone from your workspace.')
      }
      const all = targetsOf(ctx)
      const previous = all.find((t) => t.userId === input.userId && t.month === input.month)
      const target: Target = { ...input, id: previous?.id ?? newId('target') }
      writeTargets(ctx, [...all.filter((t) => t.id !== target.id), target])
      recordAudit(ctx, {
        action: previous ? 'updated' : 'created',
        entity: 'target',
        entityId: target.id,
        entityLabel: `${input.month} ${input.userId ? ctx.db.find('users', input.userId)?.name : 'Team'}`,
        previousValue: previous ? { revenue: previous.revenue, dealsWon: previous.dealsWon, leadsContacted: previous.leadsContacted } : null,
        newValue: { revenue: target.revenue, dealsWon: target.dealsWon, leadsContacted: target.leadsContacted },
      })
      return target
    }),
  deleteTarget: (id) =>
    request((ctx) => {
      ctx.requireFeature('manage-targets')
      const all = targetsOf(ctx)
      const target = all.find((t) => t.id === id)
      if (!target) throw validationError('id', 'Target not found.')
      writeTargets(ctx, all.filter((t) => t.id !== id))
      recordAudit(ctx, { action: 'deleted', entity: 'target', entityId: id, entityLabel: target.month })
    }),
  targetProgress: (month) =>
    request((ctx): TargetProgress[] =>
      visibleTargets(ctx, month).map((target) => ({
        userId: target.userId,
        name: target.userId ? (ctx.db.find('users', target.userId)?.name ?? 'Rep') : 'Team',
        month,
        rows: buildTargetRows(
          { revenue: target.revenue, dealsWon: target.dealsWon, leadsContacted: target.leadsContacted },
          actualsFor(ctx, month, target.userId),
          month,
          ctx.now,
        ),
      })),
    ),
}
