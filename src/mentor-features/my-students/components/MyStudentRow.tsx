import { ArrowRight } from 'lucide-react'
import type { AssignedStudent } from '../types'

interface MyStudentRowProps {
  student: AssignedStudent
  onSelectStudent: (student: AssignedStudent) => void
}

export function MyStudentRow({ student, onSelectStudent }: MyStudentRowProps) {
  const isPresent = student.statusToday === 'present'
  const isAbsent = student.statusToday === 'absent'

  const statusText =
    student.statusToday === 'present'
      ? 'Present today'
      : student.statusToday === 'absent'
      ? 'Absent today'
      : 'Late today'

  // Avatar background styling based subtly on status
  const avatarBgClass = isPresent
    ? 'bg-emerald-50 text-[#059669] border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
    : isAbsent
    ? 'bg-rose-50 text-[#DC2626] border border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
    : 'bg-amber-50 text-[#D97706] border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'

  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors border-b border-[#E2E8F0]/80 dark:border-border last:border-b-0">
      {/* STUDENT */}
      <td className="py-3.5 px-4 min-w-[200px]">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${avatarBgClass}`}
          >
            {student.avatarInitials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#17324D] dark:text-foreground truncate">
              {student.name}
            </div>
            <div className="text-xs text-[#64748B] dark:text-slate-400 truncate sm:hidden">
              {student.rollNumber}
            </div>
          </div>
        </div>
      </td>

      {/* STUDENT ID */}
      <td className="py-3.5 px-4 text-xs font-semibold text-[#64748B] dark:text-slate-400">
        {student.rollNumber}
      </td>

      {/* CLASS / BATCH */}
      <td className="py-3.5 px-4 text-xs font-medium text-[#17324D] dark:text-foreground">
        {student.classBatch}
      </td>

      {/* EMAIL */}
      <td className="py-3.5 px-4 text-xs text-[#64748B] dark:text-slate-400 truncate max-w-[180px]">
        {student.email}
      </td>

      {/* ATTENDANCE */}
      <td className="py-3.5 px-4 text-xs font-bold text-[#17324D] dark:text-foreground">
        <span
          className={
            student.attendancePercentage >= 90
              ? 'text-[#059669]'
              : student.attendancePercentage >= 75
              ? 'text-[#17324D] dark:text-foreground'
              : 'text-[#DC2626]'
          }
        >
          {student.attendancePercentage}%
        </span>
      </td>

      {/* STATUS */}
      <td className="py-3.5 px-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
            isPresent
              ? 'bg-emerald-50 text-[#059669] border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
              : isAbsent
              ? 'bg-rose-50 text-[#DC2626] border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
              : 'bg-amber-50 text-[#D97706] border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
          }`}
        >
          {statusText}
        </span>
      </td>

      {/* ACTION */}
      <td className="py-3.5 px-4 text-right">
        <button
          type="button"
          onClick={() => onSelectStudent(student)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-subtle rounded-md transition-colors cursor-pointer"
        >
          <span>View</span>
          <ArrowRight className="size-3.5" />
        </button>
      </td>
    </tr>
  )
}
