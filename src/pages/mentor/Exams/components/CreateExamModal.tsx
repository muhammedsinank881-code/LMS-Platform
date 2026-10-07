import { useState } from 'react'
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
  Textarea,
} from '@/components/ui'
import type { MentorExam } from '../types'

interface CreateExamModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableClasses: string[]
  onCreateExam: (newExam: Omit<MentorExam, 'id' | 'mentorId' | 'studentGrades'>) => void
}

export function CreateExamModal({
  open,
  onOpenChange,
  availableClasses,
  onCreateExam,
}: CreateExamModalProps) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [classBatch, setClassBatch] = useState(availableClasses[0] || 'BCA - 1st Year')
  const [date, setDate] = useState('2026-10-15')
  const [time, setTime] = useState('10:00 AM')
  const [duration, setDuration] = useState('2 Hours')
  const [room, setRoom] = useState('Room 101')
  const [totalMarks, setTotalMarks] = useState<number>(50)
  const [instructions, setInstructions] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !subject.trim() || !classBatch.trim()) return

    // Format date string for display (e.g. 15 Oct)
    const dateObj = new Date(date)
    const formattedDate = isNaN(dateObj.getTime())
      ? date
      : dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })

    onCreateExam({
      title: title.trim(),
      subject: subject.trim(),
      classBatch,
      courseName: 'Bachelor of Computer Applications',
      year: classBatch.includes('1st')
        ? '1st Year'
        : classBatch.includes('2nd')
        ? '2nd Year'
        : classBatch.includes('3rd')
        ? '3rd Year'
        : 'Final Year',
      date,
      formattedDate,
      time: time.trim() || '10:00 AM',
      duration: duration.trim() || '2 Hours',
      studentsCount: 30,
      room: room.trim() || 'Room 101',
      status: 'upcoming',
      totalMarks: Number(totalMarks) || 50,
      passingMarks: Math.round((Number(totalMarks) || 50) * 0.4),
      instructions: instructions.trim() || 'Standard exam instructions apply.',
    })

    // Reset form
    setTitle('')
    setSubject('')
    setInstructions('')
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="rounded-2xl border-[#E2E8F0] dark:border-border">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle className="text-xl font-bold text-[#17324D] dark:text-foreground">
              Create New Exam
            </ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="exam-title" className="text-xs font-bold text-[#17324D] dark:text-slate-200">
                Exam Title *
              </Label>
              <Input
                id="exam-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flutter Development Practical Exam"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="exam-subject" className="text-xs font-bold text-[#17324D] dark:text-slate-200">
                  Subject *
                </Label>
                <Input
                  id="exam-subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mobile App Development"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exam-class" className="text-xs font-bold text-[#17324D] dark:text-slate-200">
                  Class / Batch *
                </Label>
                <select
                  id="exam-class"
                  value={classBatch}
                  onChange={(e) => setClassBatch(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl text-sm text-[#17324D] dark:text-foreground focus:ring-2 focus:ring-[#0F9F83] focus:outline-none"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                  <option value="BCA - 1st Year">BCA - 1st Year</option>
                  <option value="BCA - 2nd Year">BCA - 2nd Year</option>
                  <option value="BCA - 3rd Year">BCA - 3rd Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="exam-date" className="text-xs font-bold text-[#17324D] dark:text-slate-200">
                  Date *
                </Label>
                <Input
                  id="exam-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exam-time" className="text-xs font-bold text-[#17324D] dark:text-slate-200">
                  Start Time
                </Label>
                <Input
                  id="exam-time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 02:00 PM"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exam-duration" className="text-xs font-bold text-[#17324D] dark:text-slate-200">
                  Duration
                </Label>
                <Input
                  id="exam-duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 3 Hours"
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="exam-room" className="text-xs font-bold text-[#17324D] dark:text-slate-200">
                  Room / Venue
                </Label>
                <Input
                  id="exam-room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Lab 4"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="total-marks" className="text-xs font-bold text-[#17324D] dark:text-slate-200">
                  Total Marks
                </Label>
                <Input
                  id="total-marks"
                  type="number"
                  min={10}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instructions" className="text-xs font-bold text-[#17324D] dark:text-slate-200">
                Instructions / Notes
              </Label>
              <Textarea
                id="instructions"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Add exam guidelines, permitted materials, or lab prerequisites..."
                className="rounded-xl"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-[#E2E8F0] text-[#64748B]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0F9F83] hover:bg-[#0C826B] text-white font-semibold rounded-xl"
            >
              Create Exam
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
