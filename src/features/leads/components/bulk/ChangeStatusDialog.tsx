import { useMemo, useState } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Select,
} from '@/components/ui'
import { FormField } from '@/components/common/FormField'
import type { LeadStatus, LostReason } from '@/types'

export interface ChangeStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statuses: LeadStatus[]
  lostReasons: LostReason[]
  count: number
  loading?: boolean
  onSubmit: (input: { statusId: string; lostReasonId?: string }) => void
}

export function ChangeStatusDialog({
  open,
  onOpenChange,
  statuses,
  lostReasons,
  count,
  loading,
  onSubmit,
}: ChangeStatusDialogProps) {
  const [statusId, setStatusId] = useState<string>()
  const [lostReasonId, setLostReasonId] = useState<string>()
  const selected = statuses.find((item) => item.id === statusId)
  const needsReason = selected?.type === 'lost'

  const statusOptions = useMemo(
    () => [...statuses].sort((a, b) => a.order - b.order).map((item) => ({ value: item.id, label: item.name })),
    [statuses],
  )

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setStatusId(undefined)
          setLostReasonId(undefined)
        }
        onOpenChange(next)
      }}
    >
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Change status</ModalTitle>
          <ModalDescription>
            Update the status of {count} {count === 1 ? 'lead' : 'leads'}.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <FormField id="bulk-status" label="Status" required>
            {(control) => (
              <Select
                {...control}
                options={statusOptions}
                value={statusId}
                onValueChange={(value) => {
                  setStatusId(value)
                  setLostReasonId(undefined)
                }}
                placeholder="Choose a status"
              />
            )}
          </FormField>
          {needsReason ? (
            <FormField id="bulk-lost-reason" label="Lost reason" required>
              {(control) => (
                <Select
                  {...control}
                  options={lostReasons
                    .filter((reason) => reason.isActive)
                    .map((reason) => ({ value: reason.id, label: reason.name }))}
                  value={lostReasonId}
                  onValueChange={setLostReasonId}
                  placeholder="Why was this lost?"
                />
              )}
            </FormField>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            loading={loading}
            disabled={!statusId || (needsReason && !lostReasonId)}
            onClick={() => {
              if (!statusId) return
              onSubmit({ statusId, lostReasonId: needsReason ? lostReasonId : undefined })
            }}
          >
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
