import { bucketOf } from '@/lib/followup-buckets'
import type { Activity, CallListItem, RecentActivityItem } from '@/types'
import type { RequestContext } from '../../core/context'
import { inWindow, type ReportScope } from './scope'

const LABELS: Record<Activity['type'], string> = {
  lead_created: 'Lead created',
  assigned: 'Assigned',
  reassigned: 'Reassigned',
  status_changed: 'Status changed',
  note: 'Note',
  call: 'Call',
  whatsapp_sent: 'WhatsApp sent',
  whatsapp_received: 'WhatsApp received',
  email_sent: 'Email sent',
  email_received: 'Email received',
  followup_scheduled: 'Follow-up scheduled',
  followup_completed: 'Follow-up completed',
  meeting: 'Meeting',
  demo: 'Demo',
  quotation_sent: 'Quotation sent',
  score_changed: 'Score changed',
  merged: 'Merged',
  converted: 'Converted',
  stage_changed: 'Stage changed',
}

export function buildCallList(data: ReportScope, now: Date): CallListItem[] {
  const overdueIds = new Set(
    data.followUps
      .filter((followUp) => followUp.status !== 'done' && bucketOf(followUp.dueAt, now) === 'overdue')
      .map((followUp) => followUp.leadId),
  )
  const open = data.leads.filter((lead) => data.statusType(lead.statusId) === 'open')
  const overdue = open.filter((lead) => overdueIds.has(lead.id)).sort((a, b) => b.score - a.score)
  const hot = open
    .filter((lead) => lead.scoreCategory === 'hot' && !overdueIds.has(lead.id))
    .sort((a, b) => b.score - a.score)
  return [...overdue.map((lead) => toItem(lead, 'overdue')), ...hot.map((lead) => toItem(lead, 'hot'))].slice(0, 8)
}

function toItem(lead: ReportScope['leads'][number], reason: CallListItem['reason']): CallListItem {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    company: lead.company ?? '',
    score: lead.score,
    reason,
  }
}

export function buildRecentActivity(ctx: RequestContext, data: ReportScope): RecentActivityItem[] {
  const names = new Map(data.leads.map((lead) => [lead.id, lead.name]))
  return ctx.db
    .all('activities')
    .filter((activity) => names.has(activity.leadId) && inWindow(activity.createdAt, data.query.range))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
    .map((activity) => ({
      id: activity.id,
      leadId: activity.leadId,
      leadName: names.get(activity.leadId) ?? activity.leadId,
      type: activity.type,
      label: activity.type === 'note' ? activity.data.text : LABELS[activity.type],
      createdAt: activity.createdAt,
    }))
}
