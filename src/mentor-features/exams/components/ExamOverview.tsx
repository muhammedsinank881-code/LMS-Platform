import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ExamOverviewStats } from '../types'

interface ExamOverviewProps {
  stats: ExamOverviewStats
}

export function ExamOverview({ stats }: ExamOverviewProps) {
  const { total, upcoming, today, resultsPending } = stats

  return (
    <Card className="p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Exam Overview
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Exams */}
        <div className="p-3.5 rounded-md bg-primary-subtle border border-primary/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Total Exams</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-primary">{total}</span>
            <Badge tone="primary" size="sm">Total</Badge>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="p-3.5 rounded-md bg-muted border border-border flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Upcoming</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">{upcoming}</span>
            <Badge tone="primary" size="sm">Upcoming</Badge>
          </div>
        </div>

        {/* Today's Exams */}
        <div className="p-3.5 rounded-md bg-muted border border-border flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Today</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">{today}</span>
            <Badge tone="success" size="sm">Today</Badge>
          </div>
        </div>

        {/* Results Pending */}
        <div className="p-3.5 rounded-md bg-warning/15 border border-warning/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Results Pending</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-warning">{resultsPending}</span>
            <Badge tone="warning" size="sm">Pending</Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}

