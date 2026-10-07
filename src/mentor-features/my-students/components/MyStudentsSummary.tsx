import { GraduationCap, Layers, UserCheck } from 'lucide-react'

interface MyStudentsSummaryProps {
  totalAssigned: number
  classesCount: number
  avgAttendance: number
}

export function MyStudentsSummary({
  totalAssigned,
  classesCount,
  avgAttendance,
}: MyStudentsSummaryProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border text-foreground">
        <GraduationCap className="size-4 text-primary" />
        <span>{totalAssigned} Assigned Students</span>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-card border border-[#E2E8F0] dark:border-border text-[#17324D] dark:text-foreground">
        <Layers className="size-4 text-[#4F46E5]" />
        <span>{classesCount} Classes</span>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 text-[#059669] dark:text-emerald-400">
        <UserCheck className="size-4" />
        <span>{avgAttendance}% Attendance</span>
      </div>
    </div>
  )
}
