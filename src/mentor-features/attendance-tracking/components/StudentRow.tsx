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
    <div className="bg-white dark:bg-card border border-[#E5E7EB] dark:border-border rounded-xl px-4 py-3 h-[64px] min-h-[64px] flex items-center justify-between gap-3 transition-colors">
      {/* Left: Avatar + Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-[#172033] dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700">
          {student.avatarInitials ||
            student.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 space-y-0.5">
          <h4 className="text-sm font-semibold text-[#172033] dark:text-foreground truncate leading-tight">
            {student.name}
          </h4>
          <p className="text-xs text-[#64748B] dark:text-slate-400 truncate flex items-center gap-1.5">
            <span>{student.rollNumber}</span>
            <span>·</span>
            <span
              className={
                isPresent
                  ? 'text-[#059669] font-medium'
                  : isAbsent
                  ? 'text-[#DC2626] font-medium'
                  : 'text-[#D97706] font-medium'
              }
            >
              {statusLabel}
            </span>
          </p>
        </div>
      </div>

      {/* Right: P / A / L Segmented Control */}
      <div className="flex items-center bg-[#F1F5F9] dark:bg-slate-800 p-1 rounded-lg border border-[#E5E7EB] dark:border-slate-700 shrink-0">
        <button
          type="button"
          onClick={() => onStatusChange(student.id, 'present')}
          className={`w-8 h-8 sm:w-9 sm:h-8 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
            isPresent
              ? 'bg-[#059669] text-white shadow-xs'
              : 'text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-foreground hover:bg-slate-200/60 dark:hover:bg-slate-700'
          }`}
          title="Mark Present"
          aria-label={`Mark ${student.name} as Present`}
        >
          P
        </button>
        <button
          type="button"
          onClick={() => onStatusChange(student.id, 'absent')}
          className={`w-8 h-8 sm:w-9 sm:h-8 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
            isAbsent
              ? 'bg-[#DC2626] text-white shadow-xs'
              : 'text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-foreground hover:bg-slate-200/60 dark:hover:bg-slate-700'
          }`}
          title="Mark Absent"
          aria-label={`Mark ${student.name} as Absent`}
        >
          A
        </button>
        <button
          type="button"
          onClick={() => onStatusChange(student.id, 'late')}
          className={`w-8 h-8 sm:w-9 sm:h-8 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
            isLate
              ? 'bg-[#D97706] text-white shadow-xs'
              : 'text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-foreground hover:bg-slate-200/60 dark:hover:bg-slate-700'
          }`}
          title="Mark Late"
          aria-label={`Mark ${student.name} as Late`}
        >
          L
        </button>
      </div>
    </div>
  )
}
