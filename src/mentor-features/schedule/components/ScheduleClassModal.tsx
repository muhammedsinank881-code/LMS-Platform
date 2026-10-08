import { useState } from 'react'
import { AlertCircle, Check, CheckCircle2, MapPin, Video } from 'lucide-react'
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
import type { ClassType, MeetingPlatform, ScheduledClass } from '../types'
import { MOCK_LEARNING_MATERIALS } from '../../materials/mockData'
import { AVAILABLE_COURSES, AVAILABLE_MODULES, AVAILABLE_ROOMS } from '../mockData'

interface ScheduleClassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ScheduledClass | null
  onSubmit: (data: Omit<ScheduledClass, 'id' | 'status'> | ScheduledClass) => { success: boolean; error?: string }
}

export function ScheduleClassModal({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: ScheduleClassModalProps) {
  const [title, setTitle] = useState('')
  const [courseClass, setCourseClass] = useState(AVAILABLE_COURSES[0])
  const [semester, setSemester] = useState('5th Semester')
  const [moduleVal, setModuleVal] = useState(AVAILABLE_MODULES[0])
  const [date, setDate] = useState('2026-10-08')
  const [startTime, setStartTime] = useState('09:00 AM')
  const [endTime, setEndTime] = useState('10:00 AM')
  const [classType, setClassType] = useState<ClassType>('in-person')
  const [room, setRoom] = useState(AVAILABLE_ROOMS[0])
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>('Google Meet')
  const [meetingLink, setMeetingLink] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [capacity, setCapacity] = useState(30)
  const [attendanceRequired, setAttendanceRequired] = useState(true)
  const [allowRecording, setAllowRecording] = useState(false)
  const [notifyStudents, setNotifyStudents] = useState(true)

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [prevInitialId, setPrevInitialId] = useState<string | null>(null)

  // Sync form values when initialData changes
  const currentId = initialData?.id ?? null
  if (currentId !== prevInitialId) {
    setPrevInitialId(currentId)
    if (initialData) {
      setTitle(initialData.title)
      setCourseClass(initialData.courseClass)
      setSemester(initialData.semester)
      setModuleVal(initialData.module)
      setDate(initialData.date)
      setStartTime(initialData.startTime)
      setEndTime(initialData.endTime)
      setClassType(initialData.type)
      setRoom(initialData.room || AVAILABLE_ROOMS[0])
      setMeetingPlatform(initialData.meetingPlatform || 'Google Meet')
      setMeetingLink(initialData.meetingLink || '')
      setDescription(initialData.description || '')
      setSelectedMaterials(initialData.attachedMaterialTitles || [])
      setCapacity(initialData.capacity || 30)
      setAttendanceRequired(initialData.attendanceRequired)
      setAllowRecording(initialData.allowRecording)
      setNotifyStudents(initialData.notifyStudents)
    } else {
      setTitle('')
      setCourseClass(AVAILABLE_COURSES[0])
      setSemester('5th Semester')
      setModuleVal(AVAILABLE_MODULES[0])
      setDate('2026-10-08')
      setStartTime('09:00 AM')
      setEndTime('10:00 AM')
      setClassType('in-person')
      setRoom(AVAILABLE_ROOMS[0])
      setMeetingPlatform('Google Meet')
      setMeetingLink('')
      setDescription('')
      setSelectedMaterials([])
      setCapacity(30)
      setAttendanceRequired(true)
      setAllowRecording(false)
      setNotifyStudents(true)
    }
    setErrorMsg('')
    setSuccessMsg('')
  }

  const toggleMaterialSelect = (matTitle: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(matTitle) ? prev.filter((t) => t !== matTitle) : [...prev, matTitle],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!title.trim()) {
      setErrorMsg('Please enter a class title.')
      return
    }

    if (classType === 'online' && !meetingLink.trim()) {
      setErrorMsg('Meeting link is required for online classes.')
      return
    }

    if (classType === 'in-person' && !room) {
      setErrorMsg('Room selection is required for in-person classes.')
      return
    }

    // Calculate duration string
    const durationStr = '1.5 hours'

    const classData = {
      title: title.trim(),
      courseClass,
      semester,
      module: moduleVal,
      date,
      startTime,
      endTime,
      duration: durationStr,
      type: classType,
      room: classType === 'in-person' ? room : undefined,
      meetingPlatform: classType === 'online' ? meetingPlatform : undefined,
      meetingLink: classType === 'online' ? meetingLink.trim() : undefined,
      description: description.trim() || undefined,
      attachedMaterialTitles: selectedMaterials,
      capacity: Number(capacity) || 30,
      attendanceRequired,
      allowRecording,
      notifyStudents,
    }

    const res = initialData
      ? onSubmit({ ...initialData, ...classData })
      : onSubmit(classData)

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to schedule class.')
    } else {
      setSuccessMsg('Class scheduled successfully.')
      setTimeout(() => {
        setSuccessMsg('')
        onOpenChange(false)
      }, 1200)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="xl" className="rounded-lg border-border">
        <form onSubmit={handleSubmit}>
          <ModalHeader className="pb-3 border-b border-border">
            <ModalTitle className="text-lg font-bold text-foreground">
              {initialData ? 'Edit Class Details' : 'Schedule a Class'}
            </ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-4 py-4 max-h-[75vh] overflow-y-auto">
            {/* Success Notification Banner */}
            {successMsg ? (
              <div className="p-3.5 rounded-md bg-success/15 border border-success/30 text-success text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            ) : null}

            {/* Error Notification Banner */}
            {errorMsg ? (
              <div className="p-3.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            ) : null}

            {/* Class Title */}
            <div className="space-y-1.5">
              <Label htmlFor="class-title" className="text-xs font-semibold text-foreground">
                Class Title *
              </Label>
              <Input
                id="class-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Functions & Modules"
              />
            </div>

            {/* Course, Semester, Module */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="class-course" className="text-xs font-semibold text-foreground">
                  Class / Course *
                </Label>
                <select
                  id="class-course"
                  value={courseClass}
                  onChange={(e) => setCourseClass(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  {AVAILABLE_COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="class-sem" className="text-xs font-semibold text-foreground">
                  Semester *
                </Label>
                <select
                  id="class-sem"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="class-module" className="text-xs font-semibold text-foreground">
                  Module / Subject *
                </Label>
                <select
                  id="class-module"
                  value={moduleVal}
                  onChange={(e) => setModuleVal(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  {AVAILABLE_MODULES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="class-date" className="text-xs font-semibold text-foreground">
                  Date *
                </Label>
                <Input
                  id="class-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="start-time" className="text-xs font-semibold text-foreground">
                  Start Time *
                </Label>
                <select
                  id="start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
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
                <Label htmlFor="end-time" className="text-xs font-semibold text-foreground">
                  End Time *
                </Label>
                <select
                  id="end-time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="12:30 PM">12:30 PM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>
            </div>

            {/* Class Type Selector Tabs */}
            <div className="space-y-2 pt-1 border-t border-border">
              <Label className="text-xs font-semibold text-foreground">Class Type *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setClassType('in-person')}
                  className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    classType === 'in-person'
                      ? 'bg-primary-subtle border-primary text-primary shadow-2xs font-bold'
                      : 'bg-surface border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <MapPin className="size-4 shrink-0" />
                  <span className="text-xs">In-Person Class</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClassType('online')}
                  className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    classType === 'online'
                      ? 'bg-primary-subtle border-primary text-primary shadow-2xs font-bold'
                      : 'bg-surface border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Video className="size-4 shrink-0" />
                  <span className="text-xs">Online Class</span>
                </button>
              </div>
            </div>

            {/* Conditional Type Fields */}
            {classType === 'in-person' ? (
              <div className="space-y-1.5">
                <Label htmlFor="class-room" className="text-xs font-semibold text-foreground">
                  Room / Lab *
                </Label>
                <select
                  id="class-room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  {AVAILABLE_ROOMS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="meeting-platform" className="text-xs font-semibold text-foreground">
                    Meeting Platform *
                  </Label>
                  <select
                    id="meeting-platform"
                    value={meetingPlatform}
                    onChange={(e) => setMeetingPlatform(e.target.value as MeetingPlatform)}
                    className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="meeting-link" className="text-xs font-semibold text-foreground">
                    Meeting Link *
                  </Label>
                  <Input
                    id="meeting-link"
                    type="url"
                    required
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="class-desc" className="text-xs font-semibold text-foreground">
                Description & Agenda
              </Label>
              <Textarea
                id="class-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Continue Python functions and practical exercises..."
              />
            </div>

            {/* Attach Learning Material */}
            <div className="space-y-1.5 pt-1 border-t border-border">
              <Label className="text-xs font-semibold text-foreground">
                Attach Learning Material (Optional)
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Select existing study materials uploaded via Material Management:
              </p>

              <div className="space-y-1.5 max-h-36 overflow-y-auto p-2.5 rounded-md border border-border bg-muted/30">
                {MOCK_LEARNING_MATERIALS.map((mat) => {
                  const isSelected = selectedMaterials.includes(mat.title)

                  return (
                    <button
                      type="button"
                      key={mat.id}
                      onClick={() => toggleMaterialSelect(mat.title)}
                      className={`w-full text-left p-2 rounded-md border text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-subtle border-primary text-primary font-semibold'
                          : 'bg-surface border-border hover:bg-muted/60 text-foreground'
                      }`}
                    >
                      <span className="truncate">{mat.title} ({mat.type.toUpperCase()})</span>
                      <div className={`size-4 rounded border flex items-center justify-center ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
                        {isSelected ? <Check className="size-3" /> : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Class Settings */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Class Settings
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="capacity" className="text-xs font-semibold text-foreground">
                    Class Capacity (Students)
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <label className="flex items-center gap-2 font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attendanceRequired}
                      onChange={(e) => setAttendanceRequired(e.target.checked)}
                      className="accent-primary size-4"
                    />
                    <span>Attendance Required</span>
                  </label>

                  <label className="flex items-center gap-2 font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowRecording}
                      onChange={(e) => setAllowRecording(e.target.checked)}
                      className="accent-primary size-4"
                    />
                    <span>Allow Recording</span>
                  </label>

                  <label className="flex items-center gap-2 font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyStudents}
                      onChange={(e) => setNotifyStudents(e.target.checked)}
                      className="accent-primary size-4"
                    />
                    <span>Notify Students</span>
                  </label>
                </div>
              </div>

              {notifyStudents ? (
                <p className="text-[11px] text-muted-foreground bg-primary-subtle/50 p-2.5 rounded-md border border-primary/20">
                  Students will receive an automated notification about this scheduled class.
                </p>
              ) : null}
            </div>
          </ModalBody>

          <ModalFooter className="border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {initialData ? 'Save Changes' : 'Schedule Class'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
