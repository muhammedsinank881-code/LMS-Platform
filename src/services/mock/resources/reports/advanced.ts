import {
  averageOf,
  avgDaysInStage,
  buildCohortTable,
  conversionRate,
  findStuck,
  followUpCompletionRate,
  forecastRanges,
  groupBy,
  histogramBins,
  responseDistribution,
  speedVsConversion,
  timeToClose,
} from '@/lib/metrics'
import type {
  Forecast,
  FunnelVelocity,
  Lead,
  ResponseFollowUp,
  ResponseGroupRow,
  SourceRoiRow,
} from '@/types'
import { inWindow, type ReportScope } from './scope'
import { buildFunnel } from './series'

const inRange = (data: ReportScope) => data.leads.filter((lead) => inWindow(lead.createdAt, data.query.range))

function wonDealsByLead(data: ReportScope) {
  const map = new Map<string, { value: number; closedAt: string | null }[]>()
  for (const deal of data.deals) {
    if (data.stageType(deal.stageId) !== 'won') continue
    map.set(deal.leadId, [...(map.get(deal.leadId) ?? []), { value: deal.value, closedAt: deal.closedAt }])
  }
  return map
}

export function buildSourceRoi(data: ReportScope): SourceRoiRow[] {
  const won = wonDealsByLead(data)
  return [...groupBy(inRange(data), (lead) => lead.sourceId).entries()]
    .map(([sourceId, leads]) => {
      const qualified = leads.filter((lead) => lead.qualificationStatus === 'qualified').length
      const wonLeads = leads.filter((lead) => data.statusType(lead.statusId) === 'won')
      const deals = leads.flatMap((lead) => won.get(lead.id) ?? [])
      const closeDays = leads.flatMap((lead) =>
        (won.get(lead.id) ?? []).map((deal) => timeToClose(lead.createdAt, deal.closedAt)),
      )
      return {
        sourceId,
        label: data.sourceName(sourceId),
        leads: leads.length,
        qualified,
        won: wonLeads.length,
        qualifiedRate: conversionRate(qualified, leads.length),
        winRate: conversionRate(wonLeads.length, qualified),
        leadToWonRate: conversionRate(wonLeads.length, leads.length),
        avgDealValue: averageOf(deals.map((deal) => deal.value)),
        avgDaysToClose: averageOf(closeDays.filter((d): d is number => d !== null)),
      }
    })
    .sort((a, b) => b.leads - a.leads)
}

export function buildFunnelVelocity(data: ReportScope, stuckDays: number, now: Date): FunnelVelocity {
  const funnel = buildFunnel(data)
  const stageIds = funnel.map((row) => row.stageId)
  const visits = data.deals.map((deal) => ({
    stageId: deal.stageId,
    enteredAt: deal.stageEnteredAt,
    exitedAt: deal.closedAt,
  }))
  const days = avgDaysInStage(visits, stageIds, now)
  const wonClosed = data.deals.filter(
    (deal) => data.stageType(deal.stageId) === 'won' && inWindow(deal.closedAt, data.query.range),
  )
  const closeDays = wonClosed
    .map((deal) => timeToClose(deal.createdAt, deal.closedAt))
    .filter((value): value is number => value !== null)
  const stageName = new Map(data.stages.map((stage) => [stage.id, stage.name]))
  const open = data.deals.filter((deal) => data.stageType(deal.stageId) === 'open')
  const won = wonDealsByLead(data)
  const cohortLeads = data.leads.map((lead: Lead) => ({
    createdAt: lead.createdAt,
    convertedAt:
      data.statusType(lead.statusId) === 'won'
        ? ((won.get(lead.id) ?? []).find((deal) => deal.closedAt)?.closedAt ?? lead.updatedAt)
        : null,
  }))
  return {
    stages: funnel.map((row) => ({
      stageId: row.stageId,
      name: row.name,
      count: row.count,
      conversionFromPrevious: row.conversionFromPrevious,
      avgDaysInStage: days[row.stageId] ?? null,
    })),
    timeToClose: histogramBins(closeDays),
    avgDaysToClose: averageOf(closeDays),
    stuck: findStuck(open, stuckDays, now)
      .slice(0, 50)
      .map((deal) => ({
        dealId: deal.id,
        leadId: deal.leadId,
        title: deal.title,
        stageName: stageName.get(deal.stageId) ?? deal.stageId,
        ownerName: data.userName(deal.ownerId),
        daysInStage: deal.daysInStage,
        value: deal.value,
      })),
    cohorts: buildCohortTable(cohortLeads, now),
  }
}

function groupRows(
  leads: Lead[],
  key: (lead: Lead) => string | null,
  label: (id: string) => string,
): ResponseGroupRow[] {
  const groups = new Map<string, Lead[]>()
  for (const lead of leads) {
    const id = key(lead)
    if (id) groups.set(id, [...(groups.get(id) ?? []), lead])
  }
  return [...groups.entries()]
    .map(([id, items]) => {
      const distribution = responseDistribution(items.map((lead) => lead.firstResponseTimeMins))
      return {
        key: id,
        label: label(id),
        distribution,
        total: Object.values(distribution).reduce((a, b) => a + b, 0),
      }
    })
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total)
}

export function buildResponseFollowUp(data: ReportScope, now: Date): ResponseFollowUp {
  const leads = inRange(data)
  const due = data.followUps.filter(
    (followUp) => inWindow(followUp.dueAt, data.query.range) && Date.parse(followUp.dueAt) <= now.getTime(),
  )
  return {
    bySource: groupRows(leads, (lead) => lead.sourceId, data.sourceName),
    byRep: groupRows(leads, (lead) => lead.assignedTo, data.userName),
    followUpCompletionRate: followUpCompletionRate(due),
    missedFollowUps: due.filter((followUp) => followUp.status !== 'done').length,
    speedToLead: speedVsConversion(
      leads.map((lead) => ({
        firstResponseTimeMins: lead.firstResponseTimeMins,
        won: data.statusType(lead.statusId) === 'won',
      })),
    ),
  }
}

export function buildForecast(data: ReportScope, now: Date): Forecast {
  const open = data.deals.filter(
    (deal) => data.stageType(deal.stageId) === 'open' && Date.parse(deal.expectedCloseDate) >= now.getTime() - 30 * 86_400_000,
  )
  const months = forecastRanges(open)
  const total = (pick: (m: Forecast['months'][number]) => number) => months.reduce((t, m) => t + pick(m), 0)
  return {
    months,
    totals: {
      weighted: total((m) => m.weighted),
      worst: total((m) => m.worst),
      commit: total((m) => m.commit),
      best: total((m) => m.best),
    },
  }
}
