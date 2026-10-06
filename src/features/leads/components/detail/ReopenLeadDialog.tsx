import { useState } from 'react'
import { FormField } from '@/components/common/FormField'
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
import type { LeadStatus } from '@/types'

export function ReopenLeadDialog({
  open,
  statuses,
  loading,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  statuses: LeadStatus[]
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (statusId: string) => void
}) {
  const [statusId, setStatusId] = useState<string>()
  const options = statuses
    .filter((status) => status.type === 'open')
    .sort((a, b) => a.order - b.order)
    .map((status) => ({ value: status.id, label: status.name }))

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Reopen lead</ModalTitle>
          <ModalDescription>Choose the status to move this lead back to.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <FormField id="reopen-status" label="Status" required>
            {(control) => (
              <Select {...control} options={options} value={statusId} onValueChange={setStatusId} placeholder="Choose a status" />
            )}
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" loading={loading} disabled={!statusId} onClick={() => statusId && onConfirm(statusId)}>
            Reopen
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
