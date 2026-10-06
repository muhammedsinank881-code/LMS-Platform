import type { AutomationActivityStats, AutomationRun, AutomationRunListParams } from '@/types'
import type { RequestContext } from '../../core/context'
import { paginate } from '../../core/list-engine'

const THIRTY_DAYS = 30 * 86_400_000

export function listRuns(ctx: RequestContext, params: AutomationRunListParams = {}) {
  ctx.require('automations', 'view')
  const from = params.from ? Date.parse(params.from) : null
  const to = params.to ? Date.parse(params.to) : null
  const rows = ctx.db
    .all('automationRuns')
    .filter((run: AutomationRun) => {
      if (params.automationId && run.automationId !== params.automationId) return false
      if (params.statuses?.length && !params.statuses.includes(run.status)) return false
      if (params.entityKind && run.entity.kind !== params.entityKind) return false
      if (params.entityId && run.entity.id !== params.entityId) return false
      const started = Date.parse(run.startedAt)
      if (from !== null && started < from) return false
      if (to !== null && started > to) return false
      return true
    })
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  return paginate(rows, params.page, params.pageSize ?? 25)
}

export function stats(ctx: RequestContext): AutomationActivityStats {
  ctx.require('automations', 'view')
  const since = ctx.now.getTime() - THIRTY_DAYS
  const runs = ctx.db
    .all('automationRuns')
    .filter((r) => r.status !== 'skipped' && r.status !== 'cancelled' && Date.parse(r.startedAt) >= since)
  const succeeded = runs.filter((r) => r.status === 'succeeded').length
  const failed = runs.filter((r) => r.status === 'failed').length
  const finished = succeeded + failed
  const counts = new Map<string, { name: string; runs: number }>()
  for (const run of runs) {
    const entry = counts.get(run.automationId) ?? { name: run.automationName, runs: 0 }
    entry.runs += 1
    counts.set(run.automationId, entry)
  }
  const top = [...counts.entries()]
    .map(([automationId, { name, runs: n }]) => ({ automationId, name, runs: n }))
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 5)
  return { runs: runs.length, succeeded, failed, successRate: finished ? succeeded / finished : null, top }
}
