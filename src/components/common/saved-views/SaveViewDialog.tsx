import { useState } from 'react'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui'
import { FormField } from '@/components/common/FormField'

export interface SaveViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  initialName?: string
  confirmLabel?: string
  onSubmit: (name: string) => void
  loading?: boolean
}

export function SaveViewDialog({
  open,
  onOpenChange,
  title = 'Save view',
  initialName = '',
  confirmLabel = 'Save',
  onSubmit,
  loading = false,
}: SaveViewDialogProps) {
  const [name, setName] = useState(initialName)
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (next) setName(initialName)
        onOpenChange(next)
      }}
    >
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>Name this set of filters so you can reopen it later.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <FormField id="view-name" label="Name" required>
            {(control) => (
              <Input
                {...control}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            )}
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            loading={loading}
            disabled={name.trim().length === 0}
            onClick={() => onSubmit(name.trim())}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
