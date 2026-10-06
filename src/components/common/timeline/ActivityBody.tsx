import { StatusBadge } from '@/components/common/StatusBadge'
import { CurrencyText } from '@/components/common/CurrencyText'
import { formatDateTime } from '@/lib/format'
import type { Activity } from '@/types'
import { CALL_OUTCOME_LABEL, formatDuration } from './activity-meta'
import type { TimelineLookups } from './lookups'

function people(from: string, to: string) {
  return (
    <span>
      {from} <span aria-hidden="true">→</span> {to}
    </span>
  )
}

/** Type-specific detail under an activity title. */
export function ActivityBody({ activity, lookups }: { activity: Activity; lookups: TimelineLookups }) {
  switch (activity.type) {
    case 'lead_created':
      return (
        <p>
          {activity.data.via ? `Lead created from ${activity.data.via}` : `Source: ${lookups.sourceName(activity.data.sourceId)}`}
        </p>
      )
    case 'assigned':
      return (
        <p>
          To {lookups.userName(activity.data.toUserId)}
          {' · '}
          {activity.data.ruleId ? 'Assignment rule' : 'Manual'}
        </p>
      )
    case 'reassigned':
      return <p>{people(lookups.userName(activity.data.fromUserId), lookups.userName(activity.data.toUserId))}</p>
    case 'stage_changed': {
      const from = lookups.stage?.(activity.data.fromStageId)
      const to = lookups.stage?.(activity.data.toStageId)
      return (
        <p className="flex flex-wrap items-center gap-2">
          {from ? <StatusBadge name={from.name} color={from.color} /> : activity.data.fromStageId}
          <span aria-hidden="true">→</span>
          {to ? <StatusBadge name={to.name} color={to.color} /> : activity.data.toStageId}
        </p>
      )
    }
    case 'status_changed': {
      const from = lookups.status(activity.data.fromStatusId)
      const to = lookups.status(activity.data.toStatusId)
      return (
        <p className="flex flex-wrap items-center gap-2">
          {from ? <StatusBadge name={from.name} color={from.color} /> : activity.data.fromStatusId}
          <span aria-hidden="true">→</span>
          {to ? <StatusBadge name={to.name} color={to.color} /> : activity.data.toStatusId}
        </p>
      )
    }
    case 'note':
      return <p className="whitespace-pre-wrap">{activity.data.text}</p>
    case 'call':
      return (
        <div className="space-y-1">
          <p>
            {CALL_OUTCOME_LABEL[activity.data.outcome]} · {formatDuration(activity.data.durationSecs)}
          </p>
          {activity.data.notes ? <p className="whitespace-pre-wrap">{activity.data.notes}</p> : null}
        </div>
      )
    case 'whatsapp_sent':
    case 'whatsapp_received':
      return <p className="whitespace-pre-wrap">{activity.data.body}</p>
    case 'email_sent':
    case 'email_received':
      return (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{activity.data.subject}</p>
          <p className="whitespace-pre-wrap">{activity.data.body}</p>
        </div>
      )
    case 'followup_scheduled':
      return (
        <p>
          {activity.data.kind} · {formatDateTime(activity.data.dueAt)}
        </p>
      )
    case 'followup_completed':
      return (
        <p>
          {activity.data.kind}
          {activity.data.note ? ` · ${activity.data.note}` : ''}
        </p>
      )
    case 'meeting':
    case 'demo':
      return (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{activity.data.title}</p>
          <p>{formatDateTime(activity.data.startsAt)}</p>
          {activity.type === 'meeting' && activity.data.attendees ? <p>Attendees: {activity.data.attendees}</p> : null}
          {activity.data.notes ? <p className="whitespace-pre-wrap">{activity.data.notes}</p> : null}
        </div>
      )
    case 'quotation_sent':
      return (
        <p>
          <CurrencyText amount={activity.data.amount} /> · {activity.data.reference}
        </p>
      )
    case 'score_changed':
      return <p>{`${activity.data.from} → ${activity.data.to}`}</p>
    case 'merged':
      return <p>Merged {activity.data.secondaryLeadId}</p>
    case 'converted':
      return <p>Customer {activity.data.customerId}</p>
    default:
      return null
  }
}
