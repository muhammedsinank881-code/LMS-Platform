import type { SavedReport, SavedReportInput } from '@/types'
import type { RequestContext } from '../../core/context'
import { recordAudit } from '../../core/records'
import { newId } from '../../core/util'
import { validationError } from '../../core/validate'

export function listSavedReports(ctx: RequestContext): SavedReport[] {
  ctx.require('reports', 'view')
  return ctx.db
    .all('savedReports')
    .filter((report) => report.userId === ctx.actor.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function createSavedReport(ctx: RequestContext, input: SavedReportInput): SavedReport {
  ctx.require('reports', 'view')
  const name = input.name.trim()
  if (!name) throw validationError('name', 'Give the report a name.')
  if (listSavedReports(ctx).some((report) => report.name.toLowerCase() === name.toLowerCase())) {
    throw validationError('name', 'You already have a saved report with that name.')
  }
  const report = ctx.db.insert('savedReports', {
    id: newId('report'),
    userId: ctx.actor.id,
    name,
    tab: input.tab,
    search: input.search.replace(/^\?/, ''),
    createdAt: ctx.timestamp,
  })
  recordAudit(ctx, {
    action: 'created',
    entity: 'report',
    entityId: report.id,
    entityLabel: name,
    newValue: { tab: input.tab },
  })
  return report
}

export function deleteSavedReport(ctx: RequestContext, id: string): void {
  ctx.require('reports', 'view')
  const report = ctx.db.get('savedReports', id, 'Saved report')
  if (report.userId !== ctx.actor.id) throw validationError('id', 'That report belongs to someone else.')
  ctx.db.remove('savedReports', id)
  recordAudit(ctx, { action: 'deleted', entity: 'report', entityId: id, entityLabel: report.name })
}
