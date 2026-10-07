import { ChevronRight } from 'lucide-react'
import type { AssignedStudent } from '../types'

interface MyStudentCardProps {
  student: AssignedStudent
  onSelectStudent: (student: AssignedStudent) => void
}

export function MyStudentCard({ student, onSelectStudent }: MyStudentCardProps) {
  const isPresent = student.statusToday === 'present'
  const isAbsent = student.statusToday === 'absent'

  const statusText = isPresent
    ? 'Present today'
    : isAbsent
    ? 'Absent today'
    : 'Late today'

  const dotColorClass = isPresent
    ? 'text-[#059669]'
    : isAbsent
    ? 'text-[#DC2626]'
    : 'text-[#D97706]'

  const avatarBgClass = isPresent
    ? 'bg-emerald-50 text-[#059669] border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300'
    : isAbsent
    ? 'bg-rose-50 text-[#DC2626] border border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300'
    : 'bg-amber-50 text-[#D97706] border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300'

  return (
    <div
      onClick={() => onSelectStudent(student)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelectStudent(student)
        }
      }}
      className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer min-h-[72px]"
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${avatarBgClass}`}
        >
          {student.avatarInitials}
        </div>
        <div className="min-w-0 space-y-1">
          <h4 className="text-sm font-semibold text-[#17324D] dark:text-foreground truncate leading-tight">
            {student.name}
          </h4>
          <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
            <span>{student.rollNumber}</span>
            <span className="mx-1">·</span>
            <span>{student.classBatch}</span>
          </p>
          <p className="text-xs font-medium flex items-center gap-1.5 pt-0.5">
            <span className={`text-base leading-none ${dotColorClass}`}>●</span>
            <span className={dotColorClass}>{statusText}</span>
          </p>
        </div>
      </div>

      <ChevronRight className="size-5 text-[#94A3B8] shrink-0" />
    </div>
  )
}
