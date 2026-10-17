import { Card } from '@/components/ui/card'
import type { ClassCohortOption } from '../types'
import { ClassSelector } from './ClassSelector'
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
}: ClassDateSelectorProps) {
  return (
    <Card className="overflow-visible bg-surface border-border shadow-sm rounded-2xl">
      <ClassSelector
        selectedClass={selectedClass}
        onClassChange={onClassChange}
        classes={classes}
        getStudentCountForClass={getStudentCountForClass}
      />
      <AttendanceDateNavigation
        currentDate={currentDate}
        onPrevDay={onPrevDay}
        onNextDay={onNextDay}
        formatDateDisplay={formatDateDisplay}
      />
    </Card>
  )
}
