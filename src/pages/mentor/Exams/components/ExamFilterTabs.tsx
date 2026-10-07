import { cn } from '@/lib/cn'
import type { ExamFilterTab, ExamOverviewStats } from '../types'

interface ExamFilterTabsProps {
  activeTab: ExamFilterTab
  onTabChange: (tab: ExamFilterTab) => void
  stats: ExamOverviewStats
}

export function ExamFilterTabs({ activeTab, onTabChange, stats }: ExamFilterTabsProps) {
  const tabs: { id: ExamFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'upcoming', label: 'Upcoming', count: stats.upcoming },
    { id: 'today', label: 'Today', count: stats.today },
    { id: 'completed', label: 'Completed', count: stats.completed },
    { id: 'results_pending', label: 'Results Pending', count: stats.resultsPending },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer border select-none shrink-0',
              isActive
                ? 'bg-[#0F9F83] text-white border-[#0F9F83] shadow-2xs'
                : 'bg-white dark:bg-card text-[#64748B] dark:text-slate-400 border-[#E2E8F0] dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#17324D] dark:hover:text-foreground',
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 text-[11px] font-bold rounded-md transition-colors',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-[#17324D] dark:text-foreground',
              )}
            >
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
