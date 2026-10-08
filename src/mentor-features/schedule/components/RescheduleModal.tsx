import { useState } from 'react'
import { AlertCircle, Calendar, Clock, RefreshCw } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui'
import type { ScheduledClass } from '../types'

interface RescheduleModalProps {
  cls: ScheduledClass | null
  onClose: () => void
  onReschedule: (
    id: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
  ) => { success: boolean; error?: string }
}

export function RescheduleModal({ cls, onClose, onReschedule }: RescheduleModalProps) {
  const [newDate, setNewDate] = useState(cls?.date ?? '2026-10-09')
  const [newStartTime, setNewStartTime] = useState(cls?.startTime ?? '10:00 AM')
  const [newEndTime, setNewEndTime] = useState(cls?.endTime ?? '11:30 AM')
  const [errorMsg, setErrorMsg] = useState('')
  const [prevClsId, setPrevClsId] = useState<string | null>(null)

  if (cls && cls.id !== prevClsId) {
    setPrevClsId(cls.id)
    setNewDate(cls.date)
    setNewStartTime(cls.startTime)
    setNewEndTime(cls.endTime)
    setErrorMsg('')
  }

  if (!cls) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const res = onReschedule(cls.id, newDate, newStartTime, newEndTime)
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to reschedule class due to conflict.')
    }
  }

  return (
    <Modal open={Boolean(cls)} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="md" className="rounded-lg border-border">
        <form onSubmit={handleSubmit}>
          <ModalHeader className="pb-3 border-b border-border">
            <ModalTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <RefreshCw className="size-5 text-primary" />
              <span>Reschedule Class</span>
            </ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-4 py-4 text-xs">
            {/* Current Schedule Summary Card */}
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
              <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-[10px]">
                Currently Scheduled For:
              </span>
              <p className="font-bold text-foreground text-sm">{cls.title}</p>
              <p className="text-muted-foreground flex items-center gap-2 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5 text-primary" /> {cls.date}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="size-3.5 text-primary" /> {cls.startTime} - {cls.endTime}
                </span>
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg ? (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive font-semibold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            ) : null}

            {/* New Date */}
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-date" className="text-xs font-semibold text-foreground">
                New Date *
              </Label>
              <Input
                id="reschedule-date"
                type="date"
                required
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value)
                  setErrorMsg('')
                }}
              />
            </div>

            {/* New Times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reschedule-start" className="text-xs font-semibold text-foreground">
                  New Start Time *
                </Label>
                <select
                  id="reschedule-start"
                  value={newStartTime}
                  onChange={(e) => {
                    setNewStartTime(e.target.value)
                    setErrorMsg('')
                  }}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reschedule-end" className="text-xs font-semibold text-foreground">
                  New End Time *
                </Label>
                <select
                  id="reschedule-end"
                  value={newEndTime}
                  onChange={(e) => {
                    setNewEndTime(e.target.value)
                    setErrorMsg('')
                  }}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="12:30 PM">12:30 PM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" variant="primary">
              <RefreshCw className="size-4 mr-1.5" />
              <span>Reschedule</span>
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
