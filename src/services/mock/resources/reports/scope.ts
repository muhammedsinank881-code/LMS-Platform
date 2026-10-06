import { previousPeriod } from '@/lib/metrics'
import type { DateRange, Deal, FollowUp, Lead, PipelineStage, ReportQuery, StageType, User } from '@/types'
import type { RequestContext } from '../../core/context'
import { validationError } from '../../core/validate'

const MAX_SPAN = 400 * 86_400_000

export interface ReportScope {
  query: ReportQuery
  previous: DateRange | null
  leads: Lead[]
  deals: Deal[]
  followUps: FollowUp[]
  stages: PipelineStage[]
  statusType: (id: string) => string | undefined
  stageType: (id: string) => StageType | undefined
  sourceName: (id: string) => string
  statusName: (id: string) => string
  campaignName: (id: string) => string
  userName: (id: string) => string
  reasonName: (id: string) => string
  teamOf: (userId: string | null | undefined) => string | null
}

export function inWindow(iso: string | null | undefined, range: DateRange): boolean {
  if (!iso) return false
  const time = Date.parse(iso)
  return time >= Date.parse(range.from) && time <= Date.parse(range.to)
}

export function createdIn(leads: readonly Lead[], range: DateRange): Lead[] {
  return leads.filter((lead) => inWindow(lead.createdAt, range))
}

function assertRange(range: DateRange): void {
  const start = Date.parse(range.from)
  const end = Date.parse(range.to)
  if (Number.isNaN(start) || Number.isNaN(end) || start >= end) {
    throw validationError('range', 'Pick a valid date range.')
  }
  if (end - start > MAX_SPAN) throw validationError('range', 'Pick a range under 400 days.')
}

export function openReport(
  ctx: RequestContext,
  resource: 'dashboard' | 'reports',
  query: ReportQuery,
): ReportScope {
  ctx.require(resource, 'view')
  assertRange(query.range)
  const scope = ctx.scopeFor(resource)
  const effective: ReportQuery = {
    ...query,
    teamId: scope === 'all' ? query.teamId : undefined,
    userId: scope === 'own' ? undefined : query.userId,
  }
  const teamOf = (userId: string | null | undefined) => (userId ? (ctx.db.find('users', userId)?.teamId ?? null) : null)
  const leadOk = (lead: Lead) =>
    !lead.archivedAt &&
    ctx.inScope(resource, lead.assignedTo, lead.createdBy) &&
    (!effective.sourceId || lead.sourceId === effective.sourceId) &&
    (!effective.campaignId || lead.campaignId === effective.campaignId) &&
    (!effective.userId || lead.assignedTo === effective.userId) &&
    (!effective.teamId || teamOf(lead.assignedTo) === effective.teamId)

  const leads = ctx.db.all('leads').filter(leadOk)
  const leadById = new Map(leads.map((lead) => [lead.id, lead]))
  const deals = ctx.db.all('deals').filter((deal) => {
    if (!ctx.inScope(resource, deal.ownerId)) return false
    if (effective.userId && deal.ownerId !== effective.userId) return false
    if (effective.teamId && teamOf(deal.ownerId) !== effective.teamId) return false
    if (!effective.sourceId && !effective.campaignId) return true
    const lead = ctx.db.find('leads', deal.leadId)
    return Boolean(lead && leadOk(lead))
  })
  const followUps = ctx.db.all('followUps').filter((followUp) => {
    if (!ctx.inScope(resource, followUp.assigneeId, followUp.createdBy)) return false
    if (effective.userId && followUp.assigneeId !== effective.userId) return false
    if (effective.teamId && teamOf(followUp.assigneeId) !== effective.teamId) return false
    if (!effective.sourceId && !effective.campaignId) return true
    return leadById.has(followUp.leadId)
  })

  const pipelines = ctx.db.all('pipelines')
  const pipeline = pipelines.find((item) => item.isDefault) ?? pipelines[0]
  const stages = ctx.db
    .all('stages')
    .filter((stage) => stage.pipelineId === pipeline?.id)
    .sort((a, b) => a.order - b.order)
  const nameOf = <T extends { id: string; name: string }>(rows: T[]) => {
    const map = new Map(rows.map((row) => [row.id, row.name]))
    return (id: string) => map.get(id) ?? id
  }

  return {
    query: effective,
    previous: query.compare ? previousPeriod(query.range) : null,
    leads,
    deals,
    followUps,
    stages,
    statusType: (id) => ctx.db.find('leadStatuses', id)?.type,
    stageType: (id) => ctx.db.find('stages', id)?.type,
    sourceName: nameOf(ctx.db.all('leadSources')),
    statusName: nameOf(ctx.db.all('leadStatuses')),
    campaignName: nameOf(ctx.db.all('campaigns')),
    userName: nameOf(ctx.db.all('users') as Array<User & { name: string }>),
    reasonName: nameOf(ctx.db.all('lostReasons')),
    teamOf,
  }
}

export function dealWasOpen(deal: Deal, at: number): boolean {
  if (Date.parse(deal.createdAt) > at) return false
  return deal.closedAt === null || Date.parse(deal.closedAt) > at
}

export function leadWasOpen(lead: Lead, statusType: (id: string) => string | undefined, at: number): boolean {
  if (Date.parse(lead.createdAt) > at) return false
  if (statusType(lead.statusId) === 'open') return true
  return Date.parse(lead.updatedAt) > at
}
