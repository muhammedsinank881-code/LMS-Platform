import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { LostReasonDialog } from '@/components/common/LostReasonDialog'
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle, Select } from '@/components/ui'
import type { MoveDialog } from '@/lib/pipeline'
import type { DirectoryUser } from '@/services/api/team'
import { isLeadId, type LostReason, type PipelineStage } from '@/types'
import type { BoardCardModel } from '../lib/board-model'
import { CloseWonDialog } from './CloseWonDialog'

export interface BoardDialogState {
  card: BoardCardModel
  to: PipelineStage
  dialog: MoveDialog
}

export function BoardDialogs({
  pending,
  reasons,
  loading,
  users,
  assignCard,
  ownerId,
  onOwnerId,
  onCancel,
  onCommit,
  onCloseAssign,
  onAssign,
}: {
  pending: BoardDialogState | null
  reasons: LostReason[]
  loading: boolean
  users: DirectoryUser[]
  assignCard: BoardCardModel | null
  ownerId: string
  onOwnerId: (id: string) => void
  onCancel: () => void
  onCommit: (extra?: { lostReasonId?: string; note?: string; lostCompetitor?: string; closedAt?: string; finalValue?: number }) => void
  onCloseAssign: () => void
  onAssign: () => void
}) {
  return (
    <>
      <LostReasonDialog
        open={pending?.dialog === 'lost-reason'}
        reasons={reasons}
        loading={loading}
        onOpenChange={(open) => !open && onCancel()}
        onConfirm={({ lostReasonId, note }) => onCommit({ lostReasonId, note })}
      />
      <ConfirmDialog
        open={pending?.dialog === 'confirm'}
        onOpenChange={(open) => !open && onCancel()}
        title={pending?.to.type === 'invalid' ? 'Move to this stage?' : 'Reopen this record?'}
        description="This stage needs a confirmation before the card is saved there."
        confirmLabel="Move"
        onConfirm={() => onCommit()}
      />
      <CloseWonDialog
        open={pending?.dialog === 'close-won'}
        value={pending?.card.value ?? 0}
        loading={loading}
        onOpenChange={(open) => !open && onCancel()}
        onConfirm={(input) => onCommit(input)}
      />
      {pending?.dialog === 'convert' && pending.card.lead ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && onCancel()}
          title="Convert this lead?"
          description="Winning the lead marks it won. Open the lead to finish the customer conversion if it has not been converted yet."
          confirmLabel="Move to won"
          onConfirm={() => onCommit()}
        />
      ) : null}
      <Modal open={Boolean(assignCard)} onOpenChange={(open) => !open && onCloseAssign()}>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>Assign owner</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Select
              aria-label="Owner"
              value={ownerId}
              onValueChange={onOwnerId}
              options={users.filter((user) => user.status === 'active').map((user) => ({ value: user.id, label: user.name }))}
            />
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onCloseAssign}>Cancel</Button>
            <Button type="button" disabled={!ownerId || !assignCard || !isLeadId(assignCard.leadId)} onClick={onAssign}>
              Assign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
