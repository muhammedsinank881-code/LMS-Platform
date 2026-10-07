import type { ExamOverviewStats } from '../types'

interface ExamOverviewProps {
  stats: ExamOverviewStats
}

export function ExamOverview({ stats }: ExamOverviewProps) {
  const { total, upcoming, today, resultsPending } = stats

  return (
    <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
          Exam Overview
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Exams */}
        <div className="p-3.5 rounded-xl bg-[#E8F7F3] dark:bg-[#0F9F83]/15 border border-[#0F9F83]/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Total Exams</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F9F83]">{total}</span>
            <span className="text-[11px] font-medium text-[#0F9F83] bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-md">
              Total
            </span>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-border flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Upcoming</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#17324D] dark:text-foreground">{upcoming}</span>
            <span className="text-[11px] font-medium text-[#0F9F83] bg-[#E8F7F3] dark:bg-[#0F9F83]/20 px-2 py-0.5 rounded-md">
              Upcoming
            </span>
          </div>
        </div>

        {/* Today's Exams */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-border flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Today</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#17324D] dark:text-foreground">{today}</span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              Today
            </span>
          </div>
        </div>

        {/* Results Pending */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Results Pending</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#D97706] dark:text-amber-400">{resultsPending}</span>
            <span className="text-[11px] font-medium text-[#D97706] bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
              Results
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
