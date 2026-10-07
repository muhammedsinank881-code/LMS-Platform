import { StatCard } from './StatCard'

interface AttendanceSummaryCardProps {
  totalStudents: number
  presentCount: number
  absentCount: number
  lateCount: number
  attendanceRate: number
}

export function AttendanceSummaryCard({
  totalStudents,
  presentCount,
  absentCount,
  lateCount,
  attendanceRate,
}: AttendanceSummaryCardProps) {
  return (
    <div className="space-y-4">
      {/* Total & Progress Bar Card */}
      <div className="bg-white dark:bg-card border border-[#E5E7EB] dark:border-border rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#172033] dark:text-foreground">
            {totalStudents} Students
          </h2>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
            {attendanceRate}% Attendance
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 font-medium">
            <span>Progress</span>
            <span className="font-semibold text-[#059669] dark:text-emerald-400">
              {attendanceRate}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#059669] rounded-full transition-all duration-300"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Individual Stat Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Present"
          value={presentCount}
          colorClass="text-[#059669] dark:text-emerald-400"
          bgClass="bg-emerald-50/40 dark:bg-emerald-950/20"
          borderClass="border-emerald-100 dark:border-emerald-900/40"
        />
        <StatCard
          label="Absent"
          value={absentCount}
          colorClass="text-[#DC2626] dark:text-rose-400"
          bgClass="bg-rose-50/40 dark:bg-rose-950/20"
          borderClass="border-rose-100 dark:border-rose-900/40"
        />
        <StatCard
          label="Late"
          value={lateCount}
          colorClass="text-[#D97706] dark:text-amber-400"
          bgClass="bg-amber-50/40 dark:bg-amber-950/20"
          borderClass="border-amber-100 dark:border-amber-900/40"
        />
      </div>
    </div>
  )
}
