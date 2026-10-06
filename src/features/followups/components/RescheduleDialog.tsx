import { useState } from 'react'
import {
  Button,
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Textarea,
  TimePicker,
} from '@/components/ui'
import { Label } from '@/components/ui'
import { combineDateAndTime, QUICK_PICKS, quickPickDate, splitDueAt } from '@/lib/followup-schedule'

export function RescheduleDialog({
  open,
  initialDueAt,
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean
  initialDueAt?: string
  onOpenChange: (open: boolean) => void
  onConfirm: (dueAt: string, reason: string) => void
  loading?: boolean
}) {
  const initial = splitDueAt(initialDueAt ?? new Date().toISOString())
  const [date, setDate] = useState(initial.date)
  const [time, setTime] = useState(initial.time)
  const [reason, setReason] = useState('')

  const apply = (id: (typeof QUICK_PICKS)[number]['id']) => {
    const parts = splitDueAt(quickPickDate(id, new Date()))
    setDate(parts.date)
    setTime(parts.time)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Reschedule</ModalTitle>
          <ModalDescription>Pick a new date and time. A reason is optional.</ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {QUICK_PICKS.map((pick) => (
              <Button key={pick.id} type="button" size="sm" variant="outline" onClick={() => apply(pick.id)}>
                {pick.label}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reschedule-date">Date</Label>
              <DatePicker id="reschedule-date" value={date} onValueChange={setDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-time">Time</Label>
              <TimePicker id="reschedule-time" value={time} onValueChange={setTime} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reschedule-reason">Reason</Label>
            <Textarea id="reschedule-reason" rows={2} value={reason} onChange={(event) => setReason(event.target.value)} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={loading}
            disabled={!date || !time}
            onClick={() => onConfirm(combineDateAndTime(date, time), reason.trim())}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
