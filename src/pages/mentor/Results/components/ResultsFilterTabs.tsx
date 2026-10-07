import { cn } from '@/lib/cn'
import type { ResultsFilterTab, ResultsOverviewStats } from '../types'

interface ResultsFilterTabsProps {
  activeTab: ResultsFilterTab
  onTabChange: (tab: ResultsFilterTab) => void
  stats: ResultsOverviewStats
}

export function ResultsFilterTabs({ activeTab, onTabChange, stats }: ResultsFilterTabsProps) {
  const tabs: { id: ResultsFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'published', label: 'Published', count: stats.published },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'failed', label: 'Failed', count: 1 },
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
