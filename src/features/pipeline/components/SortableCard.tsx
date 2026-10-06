import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/cn'
import type { PipelineStage } from '@/types'
import type { BoardCardModel } from '../lib/board-model'
import { BoardCardBody } from './BoardCardBody'
import { BoardCardMenu } from './BoardCardMenu'

export const SortableCard = memo(function SortableCard({
  card,
  stages,
  ownerName,
  sourceIcon,
  now,
  canEdit,
  mobile,
  onOpen,
  onFollowUp,
  onAssign,
  onMove,
}: {
  card: BoardCardModel
  stages: PipelineStage[]
  ownerName: string
  sourceIcon: string
  now: Date
  canEdit: boolean
  mobile: boolean
  onOpen: () => void
  onFollowUp: () => void
  onAssign: () => void
  onMove: (stageId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { card },
    disabled: !canEdit || mobile,
  })
  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-md border border-border bg-surface p-3 shadow-sm',
        isDragging && 'opacity-40',
        canEdit && !mobile && 'cursor-grab',
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-1">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <BoardCardBody card={card} ownerName={ownerName} sourceIcon={sourceIcon} now={now} />
        </button>
        <BoardCardMenu
          card={card}
          stages={stages}
          canEdit={canEdit}
          mobile={mobile}
          onOpen={onOpen}
          onFollowUp={onFollowUp}
          onAssign={onAssign}
          onMove={onMove}
        />
      </div>
    </article>
  )
})
