import { useState } from 'react'
import { Pencil, Play, PhoneIncoming, PhoneMissed, PhoneOutgoing } from 'lucide-react'
import { Badge, Button, Textarea, type BadgeTone } from '@/components/ui'
import { CALL_OUTCOME_LABEL } from '@/components/common/timeline/activity-meta'
import { usePermission } from '@/hooks/use-permission'
import { formatDateTime } from '@/lib/format'
import type { CallLog, CallOutcome } from '@/types'
import { useUpdateCallNotes } from '../../hooks/use-call-logs'

const OUTCOME_TONE: Record<CallOutcome, BadgeTone> = {
  connected: 'success',
  no_answer: 'warning',
  busy: 'warning',
  voicemail: 'neutral',
  wrong_number: 'destructive',
}

function durationLabel(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (mins === 0) return `${rest}s`
  return rest ? `${mins}m ${rest}s` : `${mins}m`
}

function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function RecordingPlaceholder({ seconds }: { seconds: number }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2">
      <Button type="button" size="icon-sm" variant="outline" disabled aria-label="Play recording (placeholder)">
        <Play />
      </Button>
      <div className="h-1.5 flex-1 rounded-full bg-border" aria-hidden="true" />
      <span className="text-xs tabular-nums text-muted-foreground">0:00 / {clock(seconds)}</span>
    </div>
  )
}

function NotesEditor({ log, onDone }: { log: CallLog; onDone: () => void }) {
  const update = useUpdateCallNotes()
  const [notes, setNotes] = useState(log.notes)
  return (
    <div className="space-y-2">
      <Textarea aria-label="Call notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          loading={update.isPending}
          onClick={() => update.mutate({ id: log.id, notes }, { onSuccess: onDone })}
        >
          Save notes
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function CallCard({ log }: { log: CallLog }) {
  const { can } = usePermission()
  const [editing, setEditing] = useState(false)
  const inbound = log.direction === 'inbound'
  const missed = inbound && log.durationSecs === 0
  const Icon = missed ? PhoneMissed : inbound ? PhoneIncoming : PhoneOutgoing
  const title = missed ? 'Missed call' : inbound ? 'Incoming call' : 'Outgoing call'
  return (
    <div className="mx-auto w-full max-w-md space-y-3 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-info/10 text-info">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">
            {log.durationSecs > 0 ? `${durationLabel(log.durationSecs)} · ` : ''}
            {formatDateTime(log.startedAt)}
          </p>
        </div>
        <Badge size="sm" tone={OUTCOME_TONE[log.outcome]}>
          {CALL_OUTCOME_LABEL[log.outcome]}
        </Badge>
      </div>
      {editing ? (
        <NotesEditor log={log} onDone={() => setEditing(false)} />
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p className={log.notes ? 'text-sm' : 'text-sm italic text-muted-foreground'}>{log.notes || 'No notes yet'}</p>
          {can('inbox', 'edit') ? (
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Edit call notes" onClick={() => setEditing(true)}>
              <Pencil />
            </Button>
          ) : null}
        </div>
      )}
      {log.recordingUrl && log.durationSecs > 0 ? <RecordingPlaceholder seconds={log.durationSecs} /> : null}
    </div>
  )
}
