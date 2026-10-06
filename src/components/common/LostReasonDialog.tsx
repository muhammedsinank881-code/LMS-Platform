import { useRef, useState } from 'react'
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
  Textarea,
} from '@/components/ui'
import type { LostReason } from '@/types'

const OTHER = 'other'

export interface LostReasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reasons: LostReason[]
  loading?: boolean
  onConfirm: (input: { lostReasonId: string; note?: string }) => void
  /** Called when the dialog closes without a reason, so the caller can revert a status selector. */
  onCancel?: () => void
}

export function LostReasonDialog({
  open,
  onOpenChange,
  reasons,
  loading = false,
  onConfirm,
  onCancel,
}: LostReasonDialogProps) {
  const [reasonId, setReasonId] = useState<string>()
  const [note, setNote] = useState('')
  const [wasOpen, setWasOpen] = useState(open)
  const confirmed = useRef(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (!open) {
      setReasonId(undefined)
      setNote('')
    }
  }
  const active = reasons.filter((reason) => reason.isActive).sort((a, b) => a.order - b.order)
  const selected = active.find((reason) => reason.id === reasonId)
  const isOther = selected?.name.trim().toLowerCase() === OTHER
  const noteMissing = isOther && note.trim().length === 0
  const canSubmit = Boolean(reasonId) && !noteMissing

  const dismiss = () => {
    onOpenChange(false)
    if (!confirmed.current) onCancel?.()
    confirmed.current = false
  }

  return (
    <Modal open={open} onOpenChange={(next) => (next ? onOpenChange(true) : dismiss())}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Why was this lead lost?</ModalTitle>
          <ModalDescription>A reason is required before the lead can be marked lost.</ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <FormField id="lost-reason" label="Reason" required>
            {(control) => (
              <Select
                {...control}
                options={active.map((reason) => ({ value: reason.id, label: reason.name }))}
                value={reasonId ?? ''}
                onValueChange={setReasonId}
                placeholder="Choose a reason"
              />
            )}
          </FormField>
          <FormField id="lost-note" label={isOther ? 'Describe the reason' : 'Notes'} required={isOther}>
            {(control) => (
              <Textarea
                {...control}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={isOther ? 'What happened?' : 'Optional'}
              />
            )}
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={dismiss}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={loading}
            disabled={!canSubmit}
            onClick={() => {
              if (!reasonId) return
              confirmed.current = true
              onConfirm({ lostReasonId: reasonId, note: note.trim() || undefined })
            }}
          >
            Mark lost
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
