import { useState } from 'react'
import { activityTypesForFilter, Timeline, type ActivityChipId } from '@/components/common/timeline'
import { Button, EmptyState, toast } from '@/components/ui'
import type { Lead, ManualActivityInput } from '@/types'
import {
  useAddLeadActivity,
  useDeleteNote,
  useSetNotePinned,
  useUpdateNote,
} from '../../../hooks/use-lead-mutations'
import { useLeadTimeline, usePinnedNotes } from '../../../hooks/use-leads'
import type { LeadLookups } from '../../../types'
import { ActivityComposer, type ComposerTab } from '../ActivityComposer'
import { toTimelineLookups } from '../timeline-lookups'

export function TimelineTab({
  lead,
  lookups,
  canEdit,
  userId,
  composerTab,
  onComposerTab,
  focusTick,
}: {
  lead: Lead
  lookups: LeadLookups
  canEdit: boolean
  userId: string | null
  composerTab: ComposerTab
  onComposerTab: (tab: ComposerTab) => void
  focusTick: number
}) {
  const [chip, setChip] = useState<ActivityChipId | null>(null)
  const [showSystem, setShowSystem] = useState(true)
  const types = activityTypesForFilter(chip, showSystem)
  const timeline = useLeadTimeline(lead.id, types)
  const pinned = usePinnedNotes(lead.id)
  const add = useAddLeadActivity()
  const update = useUpdateNote()
  const remove = useDeleteNote()
  const pin = useSetNotePinned()
  const items = timeline.data?.pages.flatMap((page) => page.items) ?? []

  const submit = (input: ManualActivityInput) => {
    add.mutate(
      { id: lead.id, input },
      { onSuccess: () => toast.success('Activity logged') },
    )
  }

  return (
    <div className="space-y-4">
      {canEdit ? (
        <ActivityComposer
          tab={composerTab}
          onTabChange={onComposerTab}
          focusTick={focusTick}
          pending={add.isPending}
          onSubmit={submit}
        />
      ) : null}
      {timeline.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading activity…</p>
      ) : timeline.isError ? (
        <EmptyState
          size="sm"
          tone="destructive"
          title="Couldn't load the timeline"
          action={
            <Button variant="outline" onClick={() => void timeline.refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <Timeline
          items={items}
          pinned={pinned.data ?? []}
          lookups={toTimelineLookups(lookups)}
          chip={chip}
          showSystem={showSystem}
          onChipChange={setChip}
          onShowSystemChange={setShowSystem}
          currentUserId={userId}
          readOnly={!canEdit}
          hasMore={Boolean(timeline.hasNextPage)}
          loadingMore={timeline.isFetchingNextPage}
          onLoadMore={() => void timeline.fetchNextPage()}
          onEditNote={(activity, text) => update.mutate({ id: lead.id, activityId: activity.id, input: { text } })}
          onDeleteNote={(activity) => remove.mutate({ id: lead.id, activityId: activity.id })}
          onTogglePin={(activity, next) => pin.mutate({ id: lead.id, activityId: activity.id, pinned: next })}
        />
      )}
    </div>
  )
}
