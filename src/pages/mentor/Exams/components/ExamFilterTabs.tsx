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
              'flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer border select-none shrink-0',
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-surface text-muted-foreground border-border hover:bg-muted hover:text-foreground',
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 text-[11px] font-semibold rounded-md transition-colors',
                isActive
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
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
