import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownTrigger,
} from '@/components/ui'
import type { PipelineStage } from '@/types'
import { InboxContactItems } from '@/features/inbox/components/OpenInInboxMenu'
import type { BoardCardModel } from '../lib/board-model'

export function BoardCardMenu({
  card,
  stages,
  canEdit,
  mobile,
  onOpen,
  onFollowUp,
  onAssign,
  onMove,
}: {
  card: BoardCardModel
  stages: PipelineStage[]
  canEdit: boolean
  mobile: boolean
  onOpen: () => void
  onFollowUp: () => void
  onAssign: () => void
  onMove: (stageId: string) => void
}) {
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Actions for ${card.name}`}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownTrigger>
      <DropdownContent align="end">
        <DropdownItem onSelect={onOpen}>
          <Link to={card.href}>Open</Link>
        </DropdownItem>
        {card.lead ? (
          <>
            <DropdownSeparator />
            <InboxContactItems lead={card.lead} />
            <DropdownSeparator />
          </>
        ) : null}
        {canEdit ? <DropdownItem onSelect={onFollowUp}>Schedule follow-up</DropdownItem> : null}
        {canEdit ? <DropdownItem onSelect={onAssign}>Assign</DropdownItem> : null}
        {canEdit ? (
          <DropdownSub>
            <DropdownSubTrigger>{mobile ? 'Move to stage' : 'Change stage'}</DropdownSubTrigger>
            <DropdownSubContent>
              {stages.map((stage) => (
                <DropdownItem key={stage.id} disabled={stage.id === card.stageId} onSelect={() => onMove(stage.id)}>
                  {stage.name}
                </DropdownItem>
              ))}
            </DropdownSubContent>
          </DropdownSub>
        ) : null}
        {!canEdit ? <DropdownSeparator /> : null}
      </DropdownContent>
    </Dropdown>
  )
}
