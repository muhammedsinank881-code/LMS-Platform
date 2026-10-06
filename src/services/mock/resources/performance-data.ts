import { calendarDayKey, eachCalendarDay } from '@/lib/date-range'
import { averageResponseTime, avgDealValue, conversionRate, groupByDay } from '@/lib/metrics'
import type { Activity, ActivityCounts, DateRange, Deal, FollowUp, Lead, RepKpis } from '@/types'
import { inWindow, type ReportScope } from './reports/scope'

export const EMPTY_ACTIVITY: ActivityCounts = { calls: 0, messages: 0, emails: 0, notes: 0 }

export function countActivity(activities: readonly Activity[]): ActivityCounts {
  const counts = { ...EMPTY_ACTIVITY }
  for (const activity of activities) {
    if (activity.type === 'call') counts.calls += 1
    else if (activity.type === 'whatsapp_sent' || activity.type === 'whatsapp_received') counts.messages += 1
    else if (activity.type === 'email_sent' || activity.type === 'email_received') counts.emails += 1
    else if (activity.type === 'note') counts.notes += 1
  }
  return counts
}

interface KpiInput {
  leads: readonly Lead[]
  deals: readonly Deal[]
  range: DateRange
  stageType: ReportScope['stageType']
  statusType: ReportScope['statusType']
}

/** Headline figures for one rep (or any slice of leads and deals) over a range. */
export function repKpis({ leads, deals, range, stageType, statusType }: KpiInput): RepKpis {
  const created = leads.filter((lead) => inWindow(lead.createdAt, range))
  const won = deals.filter((deal) => stageType(deal.stageId) === 'won' && inWindow(deal.closedAt, range))
  return {
    leadsAssigned: created.length,
    contactedPct: conversionRate(created.filter((lead) => lead.lastContactedAt !== null).length, created.length),
    won: won.length,
    revenue: won.reduce((sum, deal) => sum + deal.value, 0),
    conversionRate: conversionRate(created.filter((lead) => statusType(lead.statusId) === 'won').length, created.length),
    avgResponseTimeMins: averageResponseTime(created),
    avgDealValue: avgDealValue(won),
  }
}

/** The mean of each KPI across reps, ignoring reps with no value. */
export function averageKpis(rows: readonly RepKpis[]): RepKpis {
  const mean = (pick: (kpis: RepKpis) => number | null): number | null => {
    const values = rows.map(pick).filter((value): value is number => value !== null)
    return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length
  }
  return {
    leadsAssigned: mean((k) => k.leadsAssigned) ?? 0,
    contactedPct: mean((k) => k.contactedPct),
    won: mean((k) => k.won) ?? 0,
    revenue: mean((k) => k.revenue) ?? 0,
    conversionRate: mean((k) => k.conversionRate),
    avgResponseTimeMins: mean((k) => k.avgResponseTimeMins),
    avgDealValue: mean((k) => k.avgDealValue),
  }
}

const TREND_POINTS = 14

/** Daily lead counts for a sparkline, limited to the last two weeks of the range. */
export function leadTrend(leads: readonly Lead[], range: DateRange): number[] {
  return groupByDay(
    leads.filter((lead) => inWindow(lead.createdAt, range)),
    range,
    'createdAt',
  )
    .slice(-TREND_POINTS)
    .map((point) => point.count)
}

export function activityByDay(activities: readonly Activity[], range: DateRange) {
  const days = eachCalendarDay(range) ?? []
  const byDay = new Map<string, Activity[]>()
  for (const activity of activities) {
    const day = calendarDayKey(activity.createdAt)
    if (day) byDay.set(day, [...(byDay.get(day) ?? []), activity])
  }
  return days.map((date) => ({ date, ...countActivity(byDay.get(date) ?? []) }))
}

export const AGING_BUCKETS: ReadonlyArray<{ label: string; max: number }> = [
  { label: '0-1 days', max: 1 },
  { label: '2-3 days', max: 3 },
  { label: '4-7 days', max: 7 },
  { label: '8-14 days', max: 14 },
  { label: '15+ days', max: Infinity },
]

export function leadAging(leads: readonly Lead[], now: Date) {
  const counts = AGING_BUCKETS.map((bucket) => ({ label: bucket.label, count: 0 }))
  for (const lead of leads) {
    const since = Date.parse(lead.lastContactedAt ?? lead.createdAt)
    const days = Math.floor((now.getTime() - since) / 86_400_000)
    const index = AGING_BUCKETS.findIndex((bucket) => days <= bucket.max)
    const bucket = counts[index === -1 ? counts.length - 1 : index]
    if (bucket) bucket.count += 1
  }
  return counts
}

export function openBacklog(followUps: readonly FollowUp[], leadName: (id: string) => string, now: Date) {
  return followUps
    .filter((followUp) => followUp.status !== 'done' && Date.parse(followUp.dueAt) <= now.getTime() + 7 * 86_400_000)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 20)
    .map((followUp) => ({
      id: followUp.id,
      leadId: followUp.leadId,
      leadName: leadName(followUp.leadId),
      type: followUp.type,
      dueAt: followUp.dueAt,
    }))
}
