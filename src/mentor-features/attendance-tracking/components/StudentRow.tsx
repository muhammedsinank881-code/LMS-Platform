import { Card } from '@/components/ui/card'
import type { AttendanceStatus, StudentAttendanceRecord } from '../types'

interface StudentRowProps {
  student: StudentAttendanceRecord
  onStatusChange: (id: string, status: AttendanceStatus) => void
}

export function StudentRow({ student, onStatusChange }: StudentRowProps) {
  const isPresent = student.status === 'present'
  const isAbsent = student.status === 'absent'
  const isLate = student.status === 'late'

  const statusLabel =
    student.status.charAt(0).toUpperCase() + student.status.slice(1)

  return (
    <Card className="px-4 py-3 h-[64px] min-h-[64px] flex items-center justify-between gap-3">
      {/* Left: Avatar + Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="h-10 w-10 rounded-full bg-primary-subtle text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
          {student.avatarInitials ||
            student.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 space-y-0.5">
          <h4 className="text-sm font-semibold text-foreground truncate leading-tight">
            {student.name}
          </h4>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
            <span>{student.rollNumber}</span>
            <span>·</span>
            <span
              className={
                isPresent
                  ? 'text-success font-medium'
                  : isAbsent
                  ? 'text-destructive font-medium'
                  : 'text-warning font-medium'
              }
            >
              {statusLabel}
            </span>
          </p>
        </div>
      </div>

      {/* Right: P / A / L Segmented Control */}
      <div className="flex items-center bg-muted p-1 rounded-md border border-border shrink-0">
        <button
          type="button"
          onClick={() => onStatusChange(student.id, 'present')}
          className={`w-8 h-8 sm:w-9 sm:h-8 rounded text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
            isPresent
              ? 'bg-success text-success-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface'
          }`}
          title="Mark Present"
          aria-label={`Mark ${student.name} as Present`}
        >
          P
        </button>
        <button
          type="button"
          onClick={() => onStatusChange(student.id, 'absent')}
          className={`w-8 h-8 sm:w-9 sm:h-8 rounded text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
            isAbsent
              ? 'bg-destructive text-destructive-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface'
          }`}
          title="Mark Absent"
          aria-label={`Mark ${student.name} as Absent`}
        >
          A
        </button>
        <button
          type="button"
          onClick={() => onStatusChange(student.id, 'late')}
          className={`w-8 h-8 sm:w-9 sm:h-8 rounded text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
            isLate
              ? 'bg-warning text-warning-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface'
          }`}
          title="Mark Late"
          aria-label={`Mark ${student.name} as Late`}
        >
          L
        </button>
      </div>
    </Card>
  )
}
