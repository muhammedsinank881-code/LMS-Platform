import type { AttendanceStatus, StudentAttendanceRecord } from '../types'
import { StudentRow } from './StudentRow'

interface StudentRosterListProps {
  roster: StudentAttendanceRecord[]
  searchQuery: string
  onStatusChange: (id: string, status: AttendanceStatus) => void
}

export function StudentRosterList({
  roster,
  searchQuery,
  onStatusChange,
}: StudentRosterListProps) {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Students ({roster.length})</span>
        <span>Status</span>
      </div>

      <div className="space-y-2.5">
        {roster.length === 0 ? (
          <div className="bg-surface border border-border rounded-md p-8 text-center text-sm text-muted-foreground">
            No students found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          roster.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  )
}

