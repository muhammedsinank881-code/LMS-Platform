import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { EMPTY_VALUE } from '@/lib/format/shared'
import type { Lead } from '@/types'
import { useLeadActivities } from '../../../hooks/use-leads'
import { RESPONSE_TARGET_MINS, RESPONSE_TONE_CLASS, responseTone } from '../../../lib/response-time'
import { userById, type LeadLookups } from '../../../types'
import { UserAvatarCell } from '@/components/common/UserAvatarCell'

export function AssignmentCard({ lead, lookups }: { lead: Lead; lookups: LeadLookups }) {
  const history = useLeadActivities(lead.id, { types: ['assigned', 'reassigned'], pageSize: 20 })
  const owner = userById(lookups, lead.assignedTo)
  const tone = responseTone(lead.firstResponseTimeMins)

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <UserAvatarCell name={owner?.name ?? 'Unassigned'} src={owner?.avatarUrl} />
        <p className={RESPONSE_TONE_CLASS[tone]}>
          {lead.firstResponseTimeMins === null
            ? 'Not contacted yet'
            : `First response ${lead.firstResponseTimeMins} min`}
          <span className="text-muted-foreground"> · target {RESPONSE_TARGET_MINS} min</span>
        </p>
        <ul className="space-y-2">
          {(history.data?.items ?? []).map((item) => {
            if (item.type !== 'assigned' && item.type !== 'reassigned') return null
            const text =
              item.type === 'assigned'
                ? `${userById(lookups, item.data.toUserId)?.name ?? 'Someone'} · ${item.data.ruleId ? 'Rule' : 'Manual'}`
                : `${userById(lookups, item.data.fromUserId)?.name ?? 'Unassigned'} → ${userById(lookups, item.data.toUserId)?.name ?? 'Someone'} · Manual`
            return (
              <li key={item.id} className="text-muted-foreground">
                {text} · {formatDateTime(item.createdAt)}
              </li>
            )
          })}
          {!history.isLoading && (history.data?.items.length ?? 0) === 0 ? <li>{EMPTY_VALUE}</li> : null}
        </ul>
      </CardContent>
    </Card>
  )
}
