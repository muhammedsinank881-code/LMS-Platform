import { cn } from '@/lib/cn'
import type { ClassFilterTab, ClassSummaryStats } from '../types'

interface ClassFilterTabsProps {
  activeTab: ClassFilterTab
  onTabChange: (tab: ClassFilterTab) => void
  stats: ClassSummaryStats
}

export function ClassFilterTabs({ activeTab, onTabChange, stats }: ClassFilterTabsProps) {
  const tabs: { id: ClassFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.totalCount },
    { id: 'active', label: 'Active', count: stats.activeCount },
    { id: 'completed', label: 'Completed', count: stats.completedCount },
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
              'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer border select-none shrink-0',
              isActive
                ? 'bg-[#0F9F83] text-white border-[#0F9F83] shadow-2xs'
                : 'bg-white dark:bg-card text-[#64748B] dark:text-slate-400 border-[#E2E8F0] dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#17324D] dark:hover:text-foreground',
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-bold rounded-lg transition-colors',
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
