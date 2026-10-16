import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AttendanceHeader,
  ClassDateSelector,
  AttendanceSessionCard,
  AttendanceOverview,
  AttendanceEvidenceCard,
  StudentSearch,
  AttendanceStatusFilters,
  EnrolledStudentsList,
  AttendanceDetailsView,
} from '../components'
import {
  MOCK_CLASSES,
  DEFAULT_SESSION,
  AVAILABLE_SESSIONS,
  MOCK_ROSTER_BCA3,
  MOCK_ROSTER_BCA4,
  MOCK_ROSTER_BCA5,
  MOCK_ROSTER_BSCCS,
} from '../data/mockAttendanceData'
import type {
  AttendanceStatus,
  SessionInfo,
  StudentAttendanceRecord,
} from '../types'

export function AttendanceTrackingPage() {
  const navigate = useNavigate()

  // Class & Date state
  const [selectedClass, setSelectedClass] = useState<string>('bca-3')
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 16))

  // Session info state (now selectable)
  const [session, setSession] = useState<SessionInfo>(DEFAULT_SESSION)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  // Selected student for Attendance Details navigation
  const [selectedStudent, setSelectedStudent] =
    useState<StudentAttendanceRecord | null>(null)

  // Rosters by class
  const [rostersByClass, setRostersByClass] = useState<{
    [classId: string]: StudentAttendanceRecord[]
  }>({
    'bca-3': MOCK_ROSTER_BCA3,
    'bca-4': MOCK_ROSTER_BCA4,
    'bca-5': MOCK_ROSTER_BCA5,
    'bsc-cs': MOCK_ROSTER_BSCCS,
  })

  const [savedSuccess, setSavedSuccess] = useState(false)

  // Current active roster
  const currentRoster = rostersByClass[selectedClass] || MOCK_ROSTER_BCA3

  // Current class cohort
  const currentClassObj =
    MOCK_CLASSES.find((c) => c.id === selectedClass) || MOCK_CLASSES[0]

  // Attendance metrics calculations
  const totalStudents = currentRoster.length
  const presentCount = currentRoster.filter((s) => s.status === 'present').length
  const lateCount = currentRoster.filter((s) => s.status === 'late').length
  const partialCount = currentRoster.filter((s) => s.status === 'partial').length
  const absentCount = currentRoster.filter((s) => s.status === 'absent').length
  const pendingCount = currentRoster.filter((s) => s.status === 'pending').length

  // Verified attendance rate: (present + late) / total
  const attendanceRate =
    totalStudents > 0
      ? Math.round(((presentCount + lateCount) / totalStudents) * 100)
      : 0

  // Date Navigation Handlers
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
    const today = new Date(2026, 9, 16)
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()

    const formatted = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    return isToday ? `Today · ${formatted}` : formatted
  }

  // Dynamic student count per class
  const getStudentCountForClass = (clsId: string) => {
    if (rostersByClass[clsId]) {
      return rostersByClass[clsId].length
    }
    const found = MOCK_CLASSES.find((c) => c.id === clsId)
    return found ? found.totalStudents : totalStudents
  }

  // Filtered Roster by Search and Filter Chip
  const filteredRoster = useMemo(() => {
    return currentRoster.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        activeFilter === 'all' || student.status === activeFilter

      return matchesSearch && matchesFilter
    })
  }, [currentRoster, searchQuery, activeFilter])

  // Handlers for attendance updates
  const handleStatusChange = (
    id: string,
    newStatus: AttendanceStatus,
    reason?: string,
  ) => {
    setRostersByClass((prev) => {
      const currentList = prev[selectedClass] || currentRoster
      const updatedList = currentList.map((s) => {
        if (s.id !== id) return s

        let updatedRule = s.calculationRuleText
        if (reason) {
          updatedRule = `Overridden by mentor (${reason}): Status set to ${newStatus}.`
        } else if (newStatus === 'present') {
          updatedRule = `Present — ${s.durationMinutes ?? 55} of ${
            s.totalMinutes ?? 60
          } minutes verified; minimum required: 45 minutes.`
        } else if (newStatus === 'late') {
          updatedRule = `Late — ${s.durationMinutes ?? 48} of ${
            s.totalMinutes ?? 60
          } minutes verified; joined after grace threshold.`
        } else if (newStatus === 'partial') {
          updatedRule = `Partial — ${s.durationMinutes ?? 30} of ${
            s.totalMinutes ?? 60
          } minutes verified; fell below minimum threshold.`
        } else if (newStatus === 'absent') {
          updatedRule =
            'Absent — No telemetry event or session attendance recorded.'
        }

        return {
          ...s,
          status: newStatus,
          calculationRuleText: updatedRule,
        }
      })

      return {
        ...prev,
        [selectedClass]: updatedList,
      }
    })

    // Also update selectedStudent if details view is open
    setSelectedStudent((prev) => {
      if (!prev || prev.id !== id) return prev
      return {
        ...prev,
        status: newStatus,
      }
    })

    setSavedSuccess(false)
  }

  const handleMarkAllPresent = () => {
    setRostersByClass((prev) => {
      const currentList = prev[selectedClass] || currentRoster
      const updatedList = currentList.map((s) => ({
        ...s,
        status: 'present' as AttendanceStatus,
        durationMinutes: s.durationMinutes || 55,
        totalMinutes: 60,
      }))

      return {
        ...prev,
        [selectedClass]: updatedList,
      }
    })
    setSavedSuccess(false)
  }

  const handleReset = () => {
    let initialCohort = MOCK_ROSTER_BCA3
    if (selectedClass === 'bca-4') initialCohort = MOCK_ROSTER_BCA4
    if (selectedClass === 'bca-5') initialCohort = MOCK_ROSTER_BCA5
    if (selectedClass === 'bsc-cs') initialCohort = MOCK_ROSTER_BSCCS

    setRostersByClass((prev) => ({
      ...prev,
      [selectedClass]: initialCohort,
    }))
    setSavedSuccess(false)
  }

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-4 sm:space-y-6 text-foreground">
      {selectedStudent ? (
        /* ==================================================
           ATTENDANCE DETAILS VIEW (SCREENSHOT 2)
           ================================================== */
        <AttendanceDetailsView
          student={selectedStudent}
          session={session}
          currentClass={currentClassObj}
          onBack={() => setSelectedStudent(null)}
          onUpdateStatus={handleStatusChange}
        />
      ) : (
        /* ==================================================
           MAIN ATTENDANCE PAGE (SCREENSHOT 1)
           ================================================== */
        <>
          {/* 1. Page Header */}
          <AttendanceHeader
            onBack={() => navigate('/mentor/dashboard')}
            onSave={handleSave}
            savedSuccess={savedSuccess}
          />

          {/* 2 & 3. Class / Batch Selector + Date Navigation Card */}
          <ClassDateSelector
            selectedClass={selectedClass}
            onClassChange={(clsId) => {
              setSelectedClass(clsId)
              setActiveFilter('all')
            }}
            classes={MOCK_CLASSES}
            getStudentCountForClass={getStudentCountForClass}
            currentDate={currentDate}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            formatDateDisplay={formatDateDisplay}
          />

          {/* 4. Selected Class / Session Card (Selectable Subject) */}
          <AttendanceSessionCard
            session={session}
            availableSessions={AVAILABLE_SESSIONS}
            onSessionChange={setSession}
          />

          {/* 5. Attendance Overview */}
          <AttendanceOverview
            totalStudents={totalStudents}
            presentCount={presentCount}
            lateCount={lateCount}
            partialCount={partialCount}
            absentCount={absentCount}
            pendingCount={pendingCount}
            onStatusClick={(statusId) => setActiveFilter(statusId)}
          />

          {/* 6. Evidence / Session Verification Card */}
          <AttendanceEvidenceCard
            evidenceSource={session.evidenceSource}
            verificationState={session.verificationState}
            attendanceRate={attendanceRate}
            onRefresh={() => {
              // Subtle feedback animation already handled in component
            }}
          />

          {/* 7. Full-Width Standalone Search Card */}
          <StudentSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* 8. Status Filter Chips */}
          <AttendanceStatusFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            totalCount={totalStudents}
            presentCount={presentCount}
            lateCount={lateCount}
            partialCount={partialCount}
            absentCount={absentCount}
            pendingCount={pendingCount}
          />

          {/* 9, 10, 11, 12. Enrolled Students List with Cards & Actions */}
          <EnrolledStudentsList
            roster={filteredRoster}
            totalEnrolledCount={totalStudents}
            onStudentClick={(student) => setSelectedStudent(student)}
            onStatusChange={handleStatusChange}
            onMarkAllPresent={handleMarkAllPresent}
            onReset={handleReset}
            searchQuery={searchQuery}
          />
        </>
      )}
    </div>
  )
}

export default AttendanceTrackingPage
