import { TriangleAlert } from 'lucide-react'
import { Button, Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui'
import { CopyField } from './CopyField'

/**
 * The one moment a secret is shown in full. The caller holds `secret` in local component state
 * and clears it in `onClose`, so it never reaches the query cache, a store or the URL.
 */
export function SecretRevealDialog({
  secret,
  title,
  description,
  label,
  onClose,
}: {
  secret: string | null
  title: string
  description: string
  label: string
  onClose: () => void
}) {
  return (
    <Modal open={secret !== null} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg" onInteractOutside={(event) => event.preventDefault()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div role="alert" className="flex items-start gap-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
            <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <strong>Copy it now.</strong> For your security this will not be shown again. If you lose it, you will need to create or rotate it.
            </p>
          </div>
          <CopyField label={label} value={secret ?? ''} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>I have saved it</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
