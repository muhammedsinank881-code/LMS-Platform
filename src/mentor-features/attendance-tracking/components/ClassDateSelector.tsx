import { Card } from '@/components/ui/card'
import type { ClassCohortOption, SessionInfo } from '../types'
import { AVAILABLE_SESSIONS } from '../data/mockAttendanceData'
import { ClassSelector } from './ClassSelector'
import { AttendanceSessionCard } from './AttendanceSessionCard'
import { AttendanceDateNavigation } from './AttendanceDateNavigation'

interface ClassDateSelectorProps {
  selectedClass: string
  onClassChange: (classId: string) => void
  classes: ClassCohortOption[]
  getStudentCountForClass: (classId: string) => number
  currentDate: Date
  onPrevDay: () => void
  onNextDay: () => void
  formatDateDisplay: (date: Date) => string
  session: SessionInfo
  availableSessions?: SessionInfo[]
  onSessionChange?: (session: SessionInfo) => void
  onSelectSession?: () => void
}

export function ClassDateSelector({
  selectedClass,
  onClassChange,
  classes,
  getStudentCountForClass,
  currentDate,
  onPrevDay,
  onNextDay,
  formatDateDisplay,
  session,
  availableSessions = AVAILABLE_SESSIONS,
  onSessionChange,
  onSelectSession,
}: ClassDateSelectorProps) {
  return (
    <Card className="overflow-visible bg-surface border-border shadow-sm rounded-2xl">
      {/* 1 Row on desktop/tablet (~40/60 width), vertically stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border/70 items-stretch">
        <div className="md:col-span-5 h-full">
          <ClassSelector
            selectedClass={selectedClass}
            onClassChange={onClassChange}
            classes={classes}
            getStudentCountForClass={getStudentCountForClass}
          />
        </div>
        <div className="md:col-span-7 h-full">
          <AttendanceSessionCard
            session={session}
            availableSessions={availableSessions}
            onSessionChange={onSessionChange}
            onSelectSession={onSelectSession}
            embedded
          />
        </div>
      </div>

      {/* Date Navigation row below the combined Class/Subject row */}
      <AttendanceDateNavigation
        currentDate={currentDate}
        onPrevDay={onPrevDay}
        onNextDay={onNextDay}
        formatDateDisplay={formatDateDisplay}
      />
    </Card>
  )
}
