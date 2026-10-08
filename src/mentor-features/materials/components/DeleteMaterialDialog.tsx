import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui'
import type { LearningMaterial } from '../types'

interface DeleteMaterialDialogProps {
  material: LearningMaterial | null
  onClose: () => void
  onConfirmDelete: (id: string) => void
}

export function DeleteMaterialDialog({
  material,
  onClose,
  onConfirmDelete,
}: DeleteMaterialDialogProps) {
  if (!material) return null

  return (
    <Modal open={Boolean(material)} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="sm" className="rounded-lg border-border">
        <ModalHeader>
          <ModalTitle className="text-lg font-bold text-foreground">
            Delete this material?
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-2 text-xs text-muted-foreground">
          <p>
            Are you sure you want to delete{' '}
            <span className="font-bold text-foreground">"{material.title}"</span>?
          </p>
          <p className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive font-medium">
            This material will no longer be available to students.
          </p>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirmDelete(material.id)}
          >
            Delete Material
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
