import { CheckCheck, RotateCcw } from 'lucide-react'
import type { AttendanceStatus, StudentAttendanceRecord } from '../types'
import { AttendanceStudentCard } from './AttendanceStudentCard'

interface EnrolledStudentsListProps {
  roster: StudentAttendanceRecord[]
  totalEnrolledCount: number
  onStudentClick: (student: StudentAttendanceRecord) => void
  onStatusChange: (id: string, status: AttendanceStatus) => void
  onMarkAllPresent: () => void
  onReset: () => void
  searchQuery?: string
}

export function EnrolledStudentsList({
  roster,
  totalEnrolledCount,
  onStudentClick,
  onStatusChange,
  onMarkAllPresent,
  onReset,
  searchQuery,
}: EnrolledStudentsListProps) {
  return (
    <div className="space-y-3 pt-1">
      {/* Header + Action Area */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <h3 className="text-xs sm:text-sm font-bold text-foreground">
          Enrolled Students ({roster.length === totalEnrolledCount ? totalEnrolledCount : `${roster.length} / ${totalEnrolledCount}`})
        </h3>

        {/* Compact Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onMarkAllPresent}
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/50 transition-colors cursor-pointer"
            title="Mark all students present"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Mark All Present</span>
            <span className="xs:hidden">All Present</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
            title="Reset roster attendance"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      {roster.length === 0 ? (
        <div className="p-8 text-center bg-surface border border-border rounded-2xl shadow-sm text-xs sm:text-sm text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">No students found</p>
          <p>
            {searchQuery
              ? `No results matching "${searchQuery}".`
              : 'Try selecting a different filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {roster.map((student) => (
            <AttendanceStudentCard
              key={student.id}
              student={student}
              onClick={onStudentClick}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
