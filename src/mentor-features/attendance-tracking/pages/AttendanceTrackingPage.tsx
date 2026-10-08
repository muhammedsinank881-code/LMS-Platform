import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AttendanceHeader,
  AttendanceSummaryCard,
  ClassDateSelector,
  RosterSearchActions,
  StudentRosterList,
} from '../components'
import type {
  AttendanceStatus,
  ClassCohortOption,
  StudentAttendanceRecord,
} from '../types'

const MOCK_CLASSES: ClassCohortOption[] = [
  { id: 'bca-3', name: 'BCA - 3rd Year', totalStudents: 24 },
  { id: 'bca-5', name: 'BCA - 5th Semester', totalStudents: 28 },
  { id: 'bca-4', name: 'BCA - 4th Semester', totalStudents: 12 },
]

const INITIAL_ROSTER: StudentAttendanceRecord[] = [
  {
    id: '1',
    name: 'Muhammad Riyan',
    rollNumber: 'BCA23001',
    avatarInitials: 'MR',
    status: 'late',
  },
  {
    id: '2',
    name: 'Fathima Nida',
    rollNumber: 'BCA23002',
    avatarInitials: 'FN',
    status: 'present',
  },
  {
    id: '3',
    name: 'Alan Shihab',
    rollNumber: 'BCA23003',
    avatarInitials: 'AS',
    status: 'late',
  },
  {
    id: '4',
    name: 'Rinsha K',
    rollNumber: 'BCA23004',
    avatarInitials: 'RK',
    status: 'present',
  },
  {
    id: '5',
    name: 'Aiswarya Lakshmi',
    rollNumber: 'BCA23005',
    avatarInitials: 'AL',
    status: 'present',
  },
  {
    id: '6',
    name: 'Devadathan P',
    rollNumber: 'BCA23006',
    avatarInitials: 'DP',
    status: 'absent',
  },
  {
    id: '7',
    name: 'Farhan Ahamed',
    rollNumber: 'BCA23007',
    avatarInitials: 'FA',
    status: 'present',
  },
  {
    id: '8',
    name: 'Gouri Parvathy',
    rollNumber: 'BCA23008',
    avatarInitials: 'GP',
    status: 'present',
  },
  {
    id: '9',
    name: 'Hisham Moosa',
    rollNumber: 'BCA23009',
    avatarInitials: 'HM',
    status: 'absent',
  },
  {
    id: '10',
    name: 'Kavya Suresh',
    rollNumber: 'BCA23010',
    avatarInitials: 'KS',
    status: 'present',
  },
  {
    id: '11',
    name: 'Nikhil Raj',
    rollNumber: 'BCA23011',
    avatarInitials: 'NR',
    status: 'present',
  },
  {
    id: '12',
    name: 'Saniya Thomas',
    rollNumber: 'BCA23012',
    avatarInitials: 'ST',
    status: 'absent',
  },
]

export function AttendanceTrackingPage() {
  const navigate = useNavigate()
  const [selectedClass, setSelectedClass] = useState<string>('bca-4')
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 4))
  const [searchQuery, setSearchQuery] = useState('')
  const [roster, setRoster] = useState<StudentAttendanceRecord[]>(INITIAL_ROSTER)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Calculations
  const totalStudents = roster.length
  const presentCount = roster.filter((s) => s.status === 'present').length
  const absentCount = roster.filter((s) => s.status === 'absent').length
  const lateCount = roster.filter((s) => s.status === 'late').length
  const attendanceRate =
    totalStudents > 0
      ? Math.round(((presentCount + lateCount) / totalStudents) * 100)
      : 0

  // Dynamic student count per class to prevent hardcoding/inconsistency
  const getStudentCountForClass = (clsId: string) => {
    if (clsId === selectedClass) return totalStudents
    const cls = MOCK_CLASSES.find((c) => c.id === clsId)
    return cls ? cls.totalStudents : totalStudents
  }

  // Date Nav Handlers
  const handlePrevDay = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 1)
      return d
    })
  }

  const handleNextDay = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 1)
      return d
    })
  }

  const formatDateDisplay = (date: Date) => {
    const today = new Date(2026, 9, 4)
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()

    const formatted = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    return isToday ? `Today • ${formatted}` : formatted
  }

  // Filtered Roster
  const filteredRoster = roster.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handlers
  const handleStatusChange = (id: string, newStatus: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
    )
    setSavedSuccess(false)
  }

  const handleMarkAllPresent = () => {
    setRoster((prev) => prev.map((s) => ({ ...s, status: 'present' })))
    setSavedSuccess(false)
  }

  const handleReset = () => {
    setRoster(INITIAL_ROSTER)
    setSavedSuccess(false)
  }

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* 1. Page Header */}
      <AttendanceHeader
        onBack={() => navigate('/mentor/dashboard')}
        onSave={handleSave}
        savedSuccess={savedSuccess}
      />

      {/* 2. Class + Date Selector */}
      <ClassDateSelector
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        classes={MOCK_CLASSES}
        getStudentCountForClass={getStudentCountForClass}
        currentDate={currentDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        formatDateDisplay={formatDateDisplay}
      />

      {/* 3. Attendance Summary */}
      <AttendanceSummaryCard
        totalStudents={totalStudents}
        presentCount={presentCount}
        absentCount={absentCount}
        lateCount={lateCount}
        attendanceRate={attendanceRate}
      />

      {/* 4. Search Filter & Roster Actions */}
      <RosterSearchActions
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredCount={filteredRoster.length}
        onMarkAllPresent={handleMarkAllPresent}
        onReset={handleReset}
      />

      {/* 5. Student Roster List */}
      <StudentRosterList
        roster={filteredRoster}
        searchQuery={searchQuery}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}

export default AttendanceTrackingPage
