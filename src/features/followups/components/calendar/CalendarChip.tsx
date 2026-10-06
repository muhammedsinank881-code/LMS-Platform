import { memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/cn'
import type { FollowUp } from '@/types'
import { FOLLOW_UP_TYPE_META } from '../../type-meta'

export const CalendarChip = memo(function CalendarChip({
  followUp,
  leadName,
  overdue,
  onOpen,
}: {
  followUp: FollowUp
  leadName: string
  overdue?: boolean
  onOpen: (followUp: FollowUp) => void
}) {
  const meta = FOLLOW_UP_TYPE_META[followUp.type]
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: followUp.id,
    data: { followUp },
  })
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined
  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(followUp)}
      className={cn(
        'block w-full truncate rounded-sm border px-1.5 py-0.5 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        meta.chip,
        overdue && 'border-destructive text-destructive',
        isDragging && 'opacity-60',
      )}
    >
      <span className="sr-only">{meta.label} with {leadName}</span>
      <span aria-hidden="true">{leadName}</span>
    </button>
  )
})
