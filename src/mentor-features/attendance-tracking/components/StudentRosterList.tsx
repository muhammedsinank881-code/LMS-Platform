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
      <div className="flex items-center justify-between px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
        <span>STUDENTS ({roster.length})</span>
        <span>STATUS</span>
      </div>

      <div className="space-y-2.5">
        {roster.length === 0 ? (
          <div className="bg-white dark:bg-card border border-[#E5E7EB] dark:border-border rounded-xl p-8 text-center text-sm text-[#64748B]">
            No students found matching "{searchQuery}".
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
