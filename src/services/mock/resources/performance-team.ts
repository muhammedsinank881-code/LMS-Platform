import { avgDealValue, sumPerformance } from '@/lib/metrics'
import { ApiError } from '@/services/api/errors'
import type {
  LeaderboardEntry,
  LeaderboardMetric,
  PerformanceQuery,
  RepDetail,
  RepPerformanceRow,
  TeamPerformance,
} from '@/types'
import type { RequestContext } from '../core/context'
import {
  EMPTY_ACTIVITY,
  activityByDay,
  averageKpis,
  countActivity,
  leadAging,
  leadTrend,
  openBacklog,
  repKpis,
} from './performance-data'
import { buildSalesPerformance } from './reports/performance'
import { inWindow, openReport, type ReportScope } from './reports/scope'

const isRep = (role: string) => role === 'salesperson' || role === 'team_leader'

function open(ctx: RequestContext, query: PerformanceQuery): ReportScope {
  return openReport(ctx, 'reports', { range: query.range, teamId: query.teamId })
}

/** One row per rep in the caller's data scope. */
function buildRows(ctx: RequestContext, data: ReportScope): RepPerformanceRow[] {
  const range = data.query.range
  const activities = ctx.db.all('activities').filter((activity) => inWindow(activity.createdAt, range))
  return buildSalesPerformance(ctx, data).map((row) => {
    const leads = data.leads.filter((lead) => lead.assignedTo === row.userId)
    const won = data.deals.filter(
      (deal) => deal.ownerId === row.userId && data.stageType(deal.stageId) === 'won' && inWindow(deal.closedAt, range),
    )
    return {
      ...row,
      contactedPct: row.leadsAssigned === 0 ? null : (row.leadsContacted / row.leadsAssigned) * 100,
      followUpsDue: data.followUps.filter(
        (f) => f.assigneeId === row.userId && inWindow(f.dueAt, range) && Date.parse(f.dueAt) <= ctx.now.getTime(),
      ).length,
      avgDealValue: avgDealValue(won),
      activity: countActivity(activities.filter((activity) => activity.actorId === row.userId)),
      teamId: ctx.teamOf(row.userId),
      trend: leadTrend(leads, range),
    }
  })
}

function totalsFor(rows: RepPerformanceRow[], data: ReportScope): RepPerformanceRow {
  const base = sumPerformance(rows)
  const ids = new Set(rows.map((row) => row.userId))
  const won = data.deals.filter(
    (deal) => ids.has(deal.ownerId) && data.stageType(deal.stageId) === 'won' && inWindow(deal.closedAt, data.query.range),
  )
  const activity = rows.reduce(
    (sum, row) => ({
      calls: sum.calls + row.activity.calls,
      messages: sum.messages + row.activity.messages,
      emails: sum.emails + row.activity.emails,
      notes: sum.notes + row.activity.notes,
    }),
    { ...EMPTY_ACTIVITY },
  )
  const length = Math.max(0, ...rows.map((row) => row.trend.length))
  return {
    ...base,
    contactedPct: base.leadsAssigned === 0 ? null : (base.leadsContacted / base.leadsAssigned) * 100,
    followUpsDue: rows.reduce((sum, row) => sum + row.followUpsDue, 0),
    avgDealValue: avgDealValue(won),
    activity,
    teamId: null,
    trend: Array.from({ length }, (_, i) => rows.reduce((sum, row) => sum + (row.trend[i] ?? 0), 0)),
  }
}

export function buildTeam(ctx: RequestContext, query: PerformanceQuery): TeamPerformance {
  if (ctx.scopeFor('reports') === 'own') {
    throw new ApiError('FORBIDDEN', 'The team table is limited to team leaders and managers.')
  }
  const data = open(ctx, query)
  const rows = buildRows(ctx, data)
  return { rows, totals: totalsFor(rows, data) }
}

const METRIC_VALUE: Record<LeaderboardMetric, (row: RepPerformanceRow) => number | null> = {
  revenue: (row) => row.revenue,
  won: (row) => row.won,
  conversion: (row) => row.conversionRate,
  speed: (row) => row.avgResponseTimeMins,
}

/** Ranked reps in the caller's scope. A salesperson only ever gets their own entry back. */
export function buildLeaderboard(
  ctx: RequestContext,
  query: PerformanceQuery,
  metric: LeaderboardMetric,
): LeaderboardEntry[] {
  const rows = buildRows(ctx, open(ctx, query))
  const value = METRIC_VALUE[metric]
  const ranked = rows
    .map((row) => ({ row, value: value(row) }))
    .filter((item): item is { row: RepPerformanceRow; value: number } => item.value !== null)
    .sort((a, b) => (metric === 'speed' ? a.value - b.value : b.value - a.value))
  const own = ctx.scopeFor('reports') === 'own'
  return ranked.map(({ row, value: amount }, index) => ({
    userId: row.userId,
    name: own && row.userId !== ctx.actor.id ? null : row.name,
    value: amount,
    isSelf: row.userId === ctx.actor.id,
    rank: index + 1,
  }))
}

export function buildRepDetail(ctx: RequestContext, userId: string, query: PerformanceQuery): RepDetail {
  const user = ctx.db.get('users', userId, 'Rep')
  ctx.assertInScope('reports', userId)
  const data = open(ctx, query)
  const range = data.query.range
  const leads = data.leads.filter((lead) => lead.assignedTo === userId)
  const deals = data.deals.filter((deal) => deal.ownerId === userId)
  const followUps = data.followUps.filter((followUp) => followUp.assigneeId === userId)
  const kit = { range, stageType: data.stageType, statusType: data.statusType }

  // The team average is an aggregate over the rep's team, so it never names a peer.
  const peers = ctx.db.all('users').filter((u) => isRep(u.role) && (user.teamId ? u.teamId === user.teamId : true))
  const allLeads = ctx.db.all('leads').filter((lead) => !lead.archivedAt)
  const allDeals = ctx.db.all('deals')
  const teamAverage = averageKpis(
    peers.map((peer) =>
      repKpis({
        ...kit,
        leads: allLeads.filter((lead) => lead.assignedTo === peer.id),
        deals: allDeals.filter((deal) => deal.ownerId === peer.id),
      }),
    ),
  )

  const funnel = data.stages
    .filter((stage) => stage.type !== 'invalid')
    .map((stage, index, all) => {
      const inStage = deals.filter((deal) => deal.stageId === stage.id)
      const previous = index === 0 ? null : deals.filter((deal) => deal.stageId === all[index - 1]?.id).length
      return {
        stageId: stage.id,
        name: stage.name,
        count: inStage.length,
        value: inStage.reduce((sum, deal) => sum + deal.value, 0),
        conversionFromPrevious: previous ? (inStage.length / previous) * 100 : null,
      }
    })

  const byDay = new Map<string, number[]>()
  for (const lead of leads.filter((l) => inWindow(l.createdAt, range) && l.firstResponseTimeMins !== null)) {
    const day = lead.createdAt.slice(0, 10)
    byDay.set(day, [...(byDay.get(day) ?? []), lead.firstResponseTimeMins ?? 0])
  }
  const lost = leads.filter((lead) => data.statusType(lead.statusId) === 'lost')
  const reasons = new Map<string, number>()
  for (const lead of lost) {
    const id = lead.lostReasonId ?? 'unknown'
    reasons.set(id, (reasons.get(id) ?? 0) + 1)
  }

  return {
    userId,
    name: user.name,
    isSelf: userId === ctx.actor.id,
    kpis: repKpis({ ...kit, leads, deals }),
    teamAverage,
    funnel,
    activityOverTime: activityByDay(
      ctx.db.all('activities').filter((a) => a.actorId === userId),
      range,
    ),
    responseTrend: [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, value: values.reduce((a, b) => a + b, 0) / values.length })),
    leadAging: leadAging(leads.filter((lead) => data.statusType(lead.statusId) === 'open'), ctx.now),
    lostReasons: [...reasons.entries()]
      .map(([key, count]) => ({ key, label: key === 'unknown' ? 'No reason' : data.reasonName(key), count }))
      .sort((a, b) => b.count - a.count),
    backlog: openBacklog(followUps, (id) => ctx.db.find('leads', id)?.name ?? id, ctx.now),
  }
}
