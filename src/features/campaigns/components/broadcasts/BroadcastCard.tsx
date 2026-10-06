import { Card, Badge, Button, ProgressBar, type BadgeTone } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import type { Broadcast, BroadcastStatus } from '@/types'

const TONE: Record<BroadcastStatus, BadgeTone> = {
  draft: 'neutral',
  scheduled: 'info',
  sending: 'warning',
  completed: 'success',
  cancelled: 'neutral',
}

const LABEL: Record<BroadcastStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sending: 'Sending',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function BroadcastCard({
  broadcast,
  templateName,
  canCancel,
  cancelling,
  onCancel,
}: {
  broadcast: Broadcast
  templateName: string
  canCancel: boolean
  cancelling: boolean
  onCancel: () => void
}) {
  const { stats } = broadcast
  const done = stats.sent + stats.failed
  const live = broadcast.status === 'sending' || broadcast.status === 'scheduled'
  const when =
    broadcast.schedule.mode === 'later' && broadcast.schedule.at
      ? `Scheduled for ${formatDateTime(broadcast.schedule.at)}`
      : `Started ${formatDateTime(broadcast.createdAt)}`
  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{broadcast.name}</h3>
          <p className="text-xs text-muted-foreground">
            {templateName} · {broadcast.audienceLabel} · {when}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={TONE[broadcast.status]} dot size="sm">{LABEL[broadcast.status]}</Badge>
          {canCancel && live ? (
            <Button size="sm" variant="outline" loading={cancelling} onClick={onCancel}>Cancel</Button>
          ) : null}
        </div>
      </div>
      <ProgressBar
        value={done}
        max={Math.max(1, stats.total)}
        size="md"
        tone={broadcast.status === 'completed' ? 'success' : 'primary'}
        label={`Progress: ${done} of ${stats.total} processed`}
        showValue
      />
      <dl className="grid grid-cols-3 gap-2 text-center sm:grid-cols-5">
        {(
          [
            ['Sent', stats.sent],
            ['Delivered', stats.delivered],
            ['Read', stats.read],
            ['Replied', stats.replied],
            ['Failed', stats.failed],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      {broadcast.excludedOptOut > 0 ? (
        <p className="text-xs text-muted-foreground">{broadcast.excludedOptOut} opted-out leads were excluded.</p>
      ) : null}
    </Card>
  )
}
