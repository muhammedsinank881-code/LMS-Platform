import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ResultsOverviewStats } from '../types'

interface ResultsOverviewProps {
  stats: ResultsOverviewStats
}

export function ResultsOverview({ stats }: ResultsOverviewProps) {
  const { total, published, pending, averageScore } = stats

  return (
    <Card className="p-3 sm:p-5 space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Results Overview
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {/* Total Results */}
        <div className="p-2.5 sm:p-3.5 rounded-md bg-primary-subtle border border-primary/20 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Total Results</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg sm:text-2xl font-semibold tracking-tight text-primary">{total}</span>
            <Badge tone="primary" size="sm" className="text-[10px] sm:text-xs">Total</Badge>
          </div>
        </div>

        {/* Published */}
        <div className="p-2.5 sm:p-3.5 rounded-md bg-success/10 border border-success/20 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Published</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg sm:text-2xl font-semibold tracking-tight text-success">{published}</span>
            <Badge tone="success" size="sm" className="text-[10px] sm:text-xs">Published</Badge>
          </div>
        </div>

        {/* Pending */}
        <div className="p-2.5 sm:p-3.5 rounded-md bg-warning/15 border border-warning/20 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Pending</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg sm:text-2xl font-semibold tracking-tight text-warning">{pending}</span>
            <Badge tone="warning" size="sm" className="text-[10px] sm:text-xs">Pending</Badge>
          </div>
        </div>

        {/* Average Score */}
        <div className="p-2.5 sm:p-3.5 rounded-md bg-info/10 border border-info/20 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Average Score</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg sm:text-2xl font-semibold tracking-tight text-foreground">{averageScore}%</span>
            <Badge tone="info" size="sm" className="text-[10px] sm:text-xs">Average</Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}

