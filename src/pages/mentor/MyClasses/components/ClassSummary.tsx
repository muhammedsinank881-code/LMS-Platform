import type { ClassSummaryStats } from '../types'

interface ClassSummaryProps {
  stats: ClassSummaryStats
}

export function ClassSummary({ stats }: ClassSummaryProps) {
  const { activeCount, completedCount, totalCount } = stats

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-3.5 sm:px-5 shadow-2xs">
      {/* Primary Summary Text */}
      <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-[#17324D] dark:text-foreground">
        <span className="inline-block size-2.5 rounded-full bg-[#0F9F83]" />
        <span>
          {activeCount} Active {activeCount === 1 ? 'Class' : 'Classes'} · {totalCount} Total Assigned
        </span>
      </div>

      {/* Compact Statistic Pills */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E8F7F3] text-[#0F9F83] font-semibold">
          <span>Active</span>
          <span className="ml-1 text-sm font-bold">{activeCount}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-300 font-semibold">
          <span>Completed</span>
          <span className="ml-1 text-sm font-bold text-[#17324D] dark:text-foreground">{completedCount}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-300 font-semibold">
          <span>Total</span>
          <span className="ml-1 text-sm font-bold text-[#17324D] dark:text-foreground">{totalCount}</span>
        </div>
      </div>
    </div>
  )
}
