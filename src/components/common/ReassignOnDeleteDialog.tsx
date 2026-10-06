import { useState } from 'react'
import { Button, Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, Select } from '@/components/ui'

export function ReassignOnDeleteDialog({
  open,
  onOpenChange,
  title,
  name,
  count,
  options,
  loading,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  name: string
  count: number
  options: { value: string; label: string }[]
  loading?: boolean
  onConfirm: (replacementId: string | undefined) => void
}) {
  const [replacementId, setReplacementId] = useState('')
  const needsReplacement = count > 0
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>
            {needsReplacement
              ? `${count} records use “${name}”. Choose what they should move to.`
              : `Delete “${name}”? This cannot be undone.`}
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          {needsReplacement ? (
            <Select
              aria-label="Replacement"
              value={replacementId}
              onValueChange={setReplacementId}
              options={options}
              placeholder="Choose a replacement"
            />
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={loading}
            disabled={needsReplacement && !replacementId}
            onClick={() => onConfirm(needsReplacement ? replacementId : undefined)}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
