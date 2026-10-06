import { bucketOf } from '@/lib/followup-buckets'
import {
  averageResponseTime,
  avgDealValue,
  conversionRate,
  followUpCompletionRate,
  groupBy,
} from '@/lib/metrics'
import type { FollowUpMetrics, SalesPerformanceRow } from '@/types'
import type { RequestContext } from '../../core/context'
import { createdIn, inWindow, type ReportScope } from './scope'

export function buildSalesPerformance(ctx: RequestContext, data: ReportScope): SalesPerformanceRow[] {
  const range = data.query.range
  const quotes = new Set(
    ctx.db
      .all('activities')
      .filter((activity) => activity.type === 'quotation_sent' && inWindow(activity.createdAt, range))
      .map((activity) => activity.leadId),
  )
  const people = ctx.db.all('users').filter((user) => {
    if (user.role !== 'salesperson' && user.role !== 'team_leader') return false
    if (!ctx.inScope('reports', user.id)) return false
    if (data.query.userId && user.id !== data.query.userId) return false
    if (data.query.teamId && user.teamId !== data.query.teamId) return false
    return true
  })

  return people.map((user) => {
    const leads = data.leads.filter((lead) => lead.assignedTo === user.id && inWindow(lead.createdAt, range))
    const deals = data.deals.filter((deal) => deal.ownerId === user.id && inWindow(deal.closedAt, range))
    const won = deals.filter((deal) => data.stageType(deal.stageId) === 'won')
    const lost = deals.filter((deal) => data.stageType(deal.stageId) === 'lost')
    return {
      userId: user.id,
      name: user.name,
      leadsAssigned: leads.length,
      leadsContacted: leads.filter((lead) => lead.lastContactedAt !== null).length,
      followUpsDone: data.followUps.filter(
        (followUp) => followUp.assigneeId === user.id && followUp.status === 'done' && inWindow(followUp.completedAt, range),
      ).length,
      qualified: leads.filter((lead) => lead.qualificationStatus === 'qualified').length,
      proposals: leads.filter((lead) => quotes.has(lead.id)).length,
      won: won.length,
      lost: lost.length,
      revenue: won.reduce((sum, deal) => sum + deal.value, 0),
      conversionRate: conversionRate(
        leads.filter((lead) => data.statusType(lead.statusId) === 'won').length,
        leads.length,
      ),
      avgResponseTimeMins: averageResponseTime(leads),
    }
  })
}

export function buildFollowUpMetrics(data: ReportScope, now: Date): FollowUpMetrics {
  const response = (range: ReportScope['query']['range']) =>
    averageResponseTime(createdIn(data.leads, range))
  const completion = (range: ReportScope['query']['range']) => {
    const due = data.followUps.filter(
      (followUp) => inWindow(followUp.dueAt, range) && Date.parse(followUp.dueAt) <= now.getTime(),
    )
    return followUpCompletionRate(due)
  }
  const overdue = data.followUps.filter(
    (followUp) =>
      followUp.status !== 'done' &&
      bucketOf(followUp.dueAt, now) === 'overdue' &&
      inWindow(followUp.dueAt, data.query.range),
  )
  const grouped = groupBy(overdue, (followUp) => followUp.assigneeId)
  return {
    avgResponseTimeMins: response(data.query.range),
    previousAvgResponseTimeMins: data.previous ? response(data.previous) : null,
    followUpCompletionRate: completion(data.query.range),
    previousFollowUpCompletionRate: data.previous ? completion(data.previous) : null,
    overdueBySalesperson: [...grouped.entries()]
      .map(([key, items]) => ({ key, label: data.userName(key), count: items.length }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
  }
}

export function averageWonValue(data: ReportScope): number | null {
  const won = data.deals.filter(
    (deal) => data.stageType(deal.stageId) === 'won' && inWindow(deal.closedAt, data.query.range),
  )
  return avgDealValue(won)
}
