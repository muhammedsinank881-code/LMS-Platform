import { lookupsFromMaps, type Lookups } from '@/lib/automation'
import type { RequestContext } from '../core/context'

const names = <T extends { id: string; name: string }>(rows: T[]) => new Map(rows.map((r) => [r.id, r.name]))

/** Id-to-name lookups for the workspace, for summaries and run traces. */
export function automationLookups(ctx: RequestContext): Lookups {
  return lookupsFromMaps({
    source: names(ctx.db.all('leadSources')),
    status: names(ctx.db.all('leadStatuses')),
    user: names(ctx.db.all('users')),
    team: names(ctx.db.all('teams')),
    template: names(ctx.db.all('templates')),
    campaign: names(ctx.db.all('campaigns')),
    pipeline: names(ctx.db.all('pipelines')),
    stage: names(ctx.db.all('stages')),
  })
}
