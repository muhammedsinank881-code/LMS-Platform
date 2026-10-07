import { Card } from '@/components/ui/card'
import type { ClassSummaryStats } from '../types'

interface ClassSummaryProps {
  stats: ClassSummaryStats
}

export function ClassSummary({ stats }: ClassSummaryProps) {
  const { activeCount, completedCount, totalCount } = stats

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-5">
      {/* Primary Summary Text */}
      <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground">
        <span className="inline-block size-2.5 rounded-full bg-primary" />
        <span>
          {activeCount} Active {activeCount === 1 ? 'Class' : 'Classes'} · {totalCount} Total Assigned
        </span>
      </div>

      {/* Compact Statistic Pills */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary-subtle text-primary font-semibold">
          <span>Active</span>
          <span className="ml-1 text-sm font-bold">{activeCount}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted text-muted-foreground font-semibold">
          <span>Completed</span>
          <span className="ml-1 text-sm font-bold text-foreground">{completedCount}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted text-muted-foreground font-semibold">
          <span>Total</span>
          <span className="ml-1 text-sm font-bold text-foreground">{totalCount}</span>
        </div>
      </div>
    </Card>
  )
}
