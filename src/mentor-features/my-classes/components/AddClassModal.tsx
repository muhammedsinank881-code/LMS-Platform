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
} from '@/components/ui'
import type { MentorClass } from '../types'

interface AddClassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddClass: (newClass: Omit<MentorClass, 'id' | 'mentorId' | 'attendanceRate' | 'syllabusProgress' | 'enrolledStudents'>) => void
}

export function AddClassModal({ open, onOpenChange, onAddClass }: AddClassModalProps) {
  const [title, setTitle] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [program, setProgram] = useState('BCA')
  const [year, setYear] = useState('1st Year')
  const [semester, setSemester] = useState('Semester 1')
  const [room, setRoom] = useState('Room 101')
  const [studentsCount, setStudentsCount] = useState<number>(30)
  const [status, setStatus] = useState<'active' | 'completed'>('active')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !courseCode.trim()) return

    onAddClass({
      title: title.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      courseName: 'Bachelor of Computer Applications',
      program: program.trim(),
      year: year.trim(),
      semester: semester.trim(),
      room: room.trim(),
      studentsCount: Number(studentsCount) || 30,
      status,
      iconType: 'code',
      schedule: 'Mon, Wed · 10:00 AM - 11:30 AM',
      description: description.trim() || `Course batch module for ${title.trim()}`,
    })

    // Reset form
    setTitle('')
    setCourseCode('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="rounded-lg border-border">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle className="text-lg font-semibold text-foreground">
              Add New Class
            </ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="class-title" className="text-xs font-semibold text-foreground">
                Class / Course Name *
              </Label>
              <Input
                id="class-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="course-code" className="text-xs font-semibold text-foreground">
                  Course Code *
                </Label>
                <Input
                  id="course-code"
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. BCA-103"
                  className="uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="program" className="text-xs font-semibold text-foreground">
                  Program / Degree
                </Label>
                <Input
                  id="program"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g. BCA"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="year" className="text-xs font-semibold text-foreground">
                  Year
                </Label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="semester" className="text-xs font-semibold text-foreground">
                  Semester
                </Label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="room" className="text-xs font-semibold text-foreground">
                  Room / Lab
                </Label>
                <Input
                  id="room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Room 101"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="students-count" className="text-xs font-semibold text-foreground">
                  Estimated Students
                </Label>
                <Input
                  id="students-count"
                  type="number"
                  min={1}
                  value={studentsCount}
                  onChange={(e) => setStudentsCount(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="class-status" className="text-xs font-semibold text-foreground">
                  Class Status
                </Label>
                <select
                  id="class-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'completed')}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
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
              Create Class
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
