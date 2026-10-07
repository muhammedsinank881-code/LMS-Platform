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
import type { ResultStatus, StudentResult } from '../types'

interface EnterResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableClasses: string[]
  availableExams: string[]
  onSaveResult: (newResult: Omit<StudentResult, 'id' | 'mentorId'>) => void
}

export function EnterResultModal({
  open,
  onOpenChange,
  availableClasses,
  availableExams,
  onSaveResult,
}: EnterResultModalProps) {
  const [studentName, setStudentName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [subject, setSubject] = useState(availableExams[0] || 'Web Technologies')
  const [classBatch, setClassBatch] = useState(availableClasses[0] || 'BCA - 2nd Year')
  const [marksObtained, setMarksObtained] = useState<number>(85)
  const [totalMarks, setTotalMarks] = useState<number>(100)
  const [status, setStatus] = useState<ResultStatus>('published')
  const [remarks, setRemarks] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentName.trim() || !studentId.trim()) return

    const obtained = Number(marksObtained) || 0
    const max = Number(totalMarks) || 100
    const pct = Math.round((obtained / max) * 100)

    let calculatedGrade = 'B'
    if (pct >= 90) calculatedGrade = 'A+'
    else if (pct >= 80) calculatedGrade = 'A'
    else if (pct >= 70) calculatedGrade = 'B+'
    else if (pct >= 60) calculatedGrade = 'B'
    else if (pct >= 50) calculatedGrade = 'C'
    else calculatedGrade = 'F'

    onSaveResult({
      studentName: studentName.trim(),
      studentId: studentId.trim().toUpperCase(),
      studentEmail: studentEmail.trim() || `${studentId.toLowerCase()}@example.com`,
      examId: `exam-${Date.now()}`,
      examName: `${subject} Assessment`,
      subject,
      classBatch,
      courseName: 'Bachelor of Computer Applications',
      marksObtained: obtained,
      totalMarks: max,
      percentage: pct,
      grade: calculatedGrade,
      status: pct < 40 ? 'failed' : status,
      publishedDate: status === 'published' ? new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined,
      remarks: remarks.trim() || 'Official examination grade entry.',
    })

    // Reset form
    setStudentName('')
    setStudentId('')
    setStudentEmail('')
    setRemarks('')
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="rounded-lg border-border">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle className="text-lg font-semibold text-foreground">
              Enter Student Result
            </ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="student-name" className="text-xs font-semibold text-foreground">
                  Student Name *
                </Label>
                <Input
                  id="student-name"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Muhammad Riyan"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="student-id" className="text-xs font-semibold text-foreground">
                  Student Roll / ID *
                </Label>
                <Input
                  id="student-id"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. BCA23001"
                  className="uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="result-class" className="text-xs font-semibold text-foreground">
                  Class / Batch *
                </Label>
                <select
                  id="result-class"
                  value={classBatch}
                  onChange={(e) => setClassBatch(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
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

              <div className="space-y-1.5">
                <Label htmlFor="result-exam" className="text-xs font-semibold text-foreground">
                  Exam / Subject *
                </Label>
                <select
                  id="result-exam"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  {availableExams.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                  <option value="Web Technologies">Web Technologies</option>
                  <option value="Database Systems">Database Systems</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Core Programming">Core Programming</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="marks-obtained" className="text-xs font-semibold text-foreground">
                  Marks Obtained *
                </Label>
                <Input
                  id="marks-obtained"
                  type="number"
                  min={0}
                  required
                  value={marksObtained}
                  onChange={(e) => setMarksObtained(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="max-marks" className="text-xs font-semibold text-foreground">
                  Max Marks *
                </Label>
                <Input
                  id="max-marks"
                  type="number"
                  min={10}
                  required
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="result-status" className="text-xs font-semibold text-foreground">
                  Result Status
                </Label>
                <select
                  id="result-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ResultStatus)}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="result-remarks" className="text-xs font-semibold text-foreground">
                Mentor Feedback & Remarks
              </Label>
              <Textarea
                id="result-remarks"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter feedback comments for the student..."
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Save Result
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
