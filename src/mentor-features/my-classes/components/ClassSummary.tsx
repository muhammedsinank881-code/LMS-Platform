import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ClassSummaryStats } from '../types'

interface ClassSummaryProps {
  stats: ClassSummaryStats
}

export function ClassSummary({ stats }: ClassSummaryProps) {
  const { activeCount, completedCount, totalCount } = stats

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
      {/* Primary Summary Text */}
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
        <span>
          {activeCount} Active {activeCount === 1 ? 'Class' : 'Classes'} · {totalCount} Total Assigned
        </span>
      </div>

      {/* Statistic Pills */}
      <div className="flex items-center gap-2 text-xs">
        <Badge tone="primary" size="md">
          Active: {activeCount}
        </Badge>
        <Badge tone="neutral" size="md">
          Completed: {completedCount}
        </Badge>
        <Badge tone="neutral" size="md">
          Total: {totalCount}
        </Badge>
      </div>
    </Card>
  )
}

