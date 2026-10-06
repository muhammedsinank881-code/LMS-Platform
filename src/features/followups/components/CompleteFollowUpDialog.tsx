import { useState } from 'react'
import { Button, Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, Switch, Textarea } from '@/components/ui'
import { Label } from '@/components/ui'
import { FOLLOWUP_OUTCOMES, type FollowUpOutcome } from '@/types'

const LABELS: Record<FollowUpOutcome, string> = {
  completed: 'Completed',
  no_answer: 'No answer',
  rescheduled: 'Rescheduled',
}

export interface CompleteFollowUpResult {
  outcome: FollowUpOutcome
  note: string
  scheduleNext: boolean
}

export function CompleteFollowUpDialog({
  open,
  title = 'Complete follow-up',
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean
  title?: string
  onOpenChange: (open: boolean) => void
  onConfirm: (result: CompleteFollowUpResult) => void
  loading?: boolean
}) {
  const [outcome, setOutcome] = useState<FollowUpOutcome>('completed')
  const [note, setNote] = useState('')
  const [scheduleNext, setScheduleNext] = useState(false)

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setOutcome('completed')
          setNote('')
          setScheduleNext(false)
        }
        onOpenChange(next)
      }}
    >
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>Record what happened. You can schedule the next one right away.</ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Outcome">
            {FOLLOWUP_OUTCOMES.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={outcome === item ? 'primary' : 'outline'}
                aria-pressed={outcome === item}
                onClick={() => setOutcome(item)}
              >
                {LABELS[item]}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="complete-note">Notes</Label>
            <Textarea id="complete-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="schedule-next">Schedule next follow-up</Label>
            <Switch
              id="schedule-next"
              checked={scheduleNext}
              onCheckedChange={(checked) => setScheduleNext(checked === true)}
              aria-label="Schedule next follow-up"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" loading={loading} onClick={() => onConfirm({ outcome, note: note.trim(), scheduleNext })}>
            Mark done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
