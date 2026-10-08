import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui'
import type { ScheduledClass } from '../types'

interface CancelClassDialogProps {
  cls: ScheduledClass | null
  onClose: () => void
  onConfirmCancel: (id: string) => void
}

export function CancelClassDialog({
  cls,
  onClose,
  onConfirmCancel,
}: CancelClassDialogProps) {
  if (!cls) return null

  return (
    <Modal open={Boolean(cls)} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="sm" className="rounded-lg border-border">
        <ModalHeader>
          <ModalTitle className="text-lg font-bold text-foreground">
            Cancel this class?
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-2 text-xs text-muted-foreground">
          <p>
            Are you sure you want to cancel{' '}
            <span className="font-bold text-foreground">"{cls.title}"</span> scheduled for{' '}
            <span className="font-semibold text-foreground">{cls.date} ({cls.startTime})</span>?
          </p>
          <p className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive font-medium">
            Students will be notified that this class has been cancelled.
          </p>
        </ModalBody>

        <ModalFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Keep Class
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirmCancel(cls.id)}
          >
            Cancel Class
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
