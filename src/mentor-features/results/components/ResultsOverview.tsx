import { Card } from '@/components/ui/card'
import type { ResultsOverviewStats } from '../types'

interface ResultsOverviewProps {
  stats: ResultsOverviewStats
}

export function ResultsOverview({ stats }: ResultsOverviewProps) {
  const { total, published, pending, averageScore } = stats

  return (
    <Card className="p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Results Overview
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Results */}
        <div className="p-3.5 rounded-lg bg-primary-subtle border border-primary/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Total Results</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-primary">{total}</span>
            <span className="text-[11px] font-medium text-primary bg-surface/80 px-2 py-0.5 rounded-md">
              Total
            </span>
          </div>
        </div>

        {/* Published */}
        <div className="p-3.5 rounded-lg bg-success/10 border border-success/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Published</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-success">{published}</span>
            <span className="text-[11px] font-medium text-success bg-surface/80 px-2 py-0.5 rounded-md">
              Published
            </span>
          </div>
        </div>

        {/* Pending */}
        <div className="p-3.5 rounded-lg bg-warning/15 border border-warning/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Pending</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-warning">{pending}</span>
            <span className="text-[11px] font-medium text-warning bg-surface/80 px-2 py-0.5 rounded-md">
              Pending
            </span>
          </div>
        </div>

        {/* Average Score */}
        <div className="p-3.5 rounded-lg bg-info/10 border border-info/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Average Score</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{averageScore}%</span>
            <span className="text-[11px] font-medium text-info bg-surface/80 px-2 py-0.5 rounded-md">
              Average
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
