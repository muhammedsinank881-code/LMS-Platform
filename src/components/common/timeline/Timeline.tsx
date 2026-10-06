import { Button, EmptyState, Switch } from '@/components/ui'
import type { Activity } from '@/types'
import { ACTIVITY_CHIPS, type ActivityChipId } from './filters'
import { groupActivitiesByDay } from './group'
import type { TimelineLookups } from './lookups'
import { TimelineItem, type TimelineItemProps } from './TimelineItem'

export interface TimelineProps extends Pick<
  TimelineItemProps,
  'onEditNote' | 'onDeleteNote' | 'onTogglePin'
> {
  items: Activity[]
  pinned?: Activity[]
  lookups: TimelineLookups
  chip: ActivityChipId | null
  showSystem: boolean
  onChipChange: (chip: ActivityChipId | null) => void
  onShowSystemChange: (show: boolean) => void
  currentUserId?: string | null
  readOnly?: boolean
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}

export function Timeline({
  items,
  pinned = [],
  lookups,
  chip,
  showSystem,
  onChipChange,
  onShowSystemChange,
  currentUserId,
  readOnly = false,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onEditNote,
  onDeleteNote,
  onTogglePin,
}: TimelineProps) {
  const pinnedIds = new Set(pinned.map((item) => item.id))
  const groups = groupActivitiesByDay(items.filter((item) => !pinnedIds.has(item.id)))
  const noteProps = { lookups, onEditNote, onDeleteNote, onTogglePin }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1" role="toolbar" aria-label="Filter activity">
          {ACTIVITY_CHIPS.map((item) => {
            const pressed = chip === item.id
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={pressed ? 'secondary' : 'outline'}
                aria-pressed={pressed}
                onClick={() => onChipChange(pressed ? null : item.id)}
              >
                {item.label}
              </Button>
            )
          })}
        </div>
        <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            size="sm"
            checked={showSystem}
            onCheckedChange={onShowSystemChange}
            aria-label="Show system events"
          />
          Show system events
        </label>
      </div>

      {pinned.length > 0 ? (
        <section className="space-y-3 rounded-md border border-border bg-surface p-4" aria-label="Pinned notes">
          {pinned.map((activity) => (
            <TimelineItem
              key={activity.id}
              activity={activity}
              pinned
              canChangeNote={!readOnly && activity.actorId === currentUserId}
              {...noteProps}
            />
          ))}
        </section>
      ) : null}

      {groups.length === 0 && pinned.length === 0 ? (
        <EmptyState size="sm" title="No activity yet" description="Notes, calls and status changes show up here." />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.key} className="space-y-4">
              <h3 className="sticky top-0 z-10 bg-background py-1 text-xs font-medium text-muted-foreground">
                {group.label}
              </h3>
              <ol className="space-y-4">
                {group.items.map((activity) => (
                  <li key={activity.id}>
                    <TimelineItem
                      activity={activity}
                      canChangeNote={!readOnly && activity.type === 'note' && activity.actorId === currentUserId}
                      {...noteProps}
                    />
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {hasMore ? (
        <Button type="button" variant="outline" onClick={onLoadMore} loading={loadingMore}>
          Load more
        </Button>
      ) : null}
    </div>
  )
}
