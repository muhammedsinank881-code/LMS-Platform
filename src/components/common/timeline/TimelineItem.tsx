import { useState } from 'react'
import { Workflow, Pin, PinOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Button, Tooltip } from '@/components/ui'
import { formatDateTime, formatRelative } from '@/lib/format'
import type { Activity } from '@/types'
import { ACTIVITY_META } from './activity-meta'
import { ActivityBody } from './ActivityBody'
import type { TimelineLookups } from './lookups'

export interface TimelineItemProps {
  activity: Activity
  lookups: TimelineLookups
  pinned?: boolean
  canChangeNote?: boolean
  onEditNote?: (activity: Activity, text: string) => void
  onDeleteNote?: (activity: Activity) => void
  onTogglePin?: (activity: Activity, pinned: boolean) => void
}

export function TimelineItem({
  activity,
  lookups,
  pinned = false,
  canChangeNote = false,
  onEditNote,
  onDeleteNote,
  onTogglePin,
}: TimelineItemProps) {
  const meta = ACTIVITY_META[activity.type]
  const Icon = meta.icon
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(activity.type === 'note' ? activity.data.text : '')
  const actor = lookups.userName(activity.actorId)

  return (
    <article className="flex gap-3" aria-label={meta.label}>
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.tone}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground">
            {meta.label}
            {pinned ? <Pin className="ml-1 inline h-3.5 w-3.5 text-primary" aria-label="Pinned" /> : null}
          </h4>
          <Tooltip content={formatDateTime(activity.createdAt)}>
            <time className="text-xs text-muted-foreground" dateTime={activity.createdAt}>
              {formatRelative(activity.createdAt)}
            </time>
          </Tooltip>
        </div>
        <div className="text-sm text-muted-foreground">
          {editing && activity.type === 'note' ? (
            <form
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault()
                onEditNote?.(activity, draft)
                setEditing(false)
              }}
            >
              <textarea
                className="w-full rounded-md border border-input bg-surface p-2 text-sm text-foreground"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                aria-label="Edit note"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={!draft.trim()}>
                  Save
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <ActivityBody activity={activity} lookups={lookups} />
          )}
        </div>
        {activity.automation ? (
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Badge size="sm" tone="primary">
              <Workflow aria-hidden="true" className="h-3 w-3" />
              Automation
            </Badge>
            <Link className="hover:underline" to={`/automations/${activity.automation.id}`}>
              {activity.automation.name}
            </Link>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{actor}</p>
        )}
        {canChangeNote && activity.type === 'note' && !editing ? (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => onTogglePin?.(activity, !pinned)}>
              {pinned ? <PinOff /> : <Pin />}
              {pinned ? 'Unpin' : 'Pin'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => onDeleteNote?.(activity)}>
              Delete
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  )
}
