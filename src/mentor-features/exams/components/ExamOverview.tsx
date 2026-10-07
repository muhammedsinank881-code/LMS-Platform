import { Card } from '@/components/ui/card'
import type { ExamOverviewStats } from '../types'

interface ExamOverviewProps {
  stats: ExamOverviewStats
}

export function ExamOverview({ stats }: ExamOverviewProps) {
  const { total, upcoming, today, resultsPending } = stats

  return (
    <Card className="p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Exam Overview
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Exams */}
        <div className="p-3.5 rounded-lg bg-primary-subtle border border-primary/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Total Exams</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-primary">{total}</span>
            <span className="text-[11px] font-medium text-primary bg-surface/80 px-2 py-0.5 rounded-md">
              Total
            </span>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="p-3.5 rounded-lg bg-muted border border-border flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Upcoming</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{upcoming}</span>
            <span className="text-[11px] font-medium text-primary bg-primary-subtle px-2 py-0.5 rounded-md">
              Upcoming
            </span>
          </div>
        </div>

        {/* Today's Exams */}
        <div className="p-3.5 rounded-lg bg-muted border border-border flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Today</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{today}</span>
            <span className="text-[11px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-md">
              Today
            </span>
          </div>
        </div>

        {/* Results Pending */}
        <div className="p-3.5 rounded-lg bg-warning/15 border border-warning/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Results Pending</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-warning">{resultsPending}</span>
            <span className="text-[11px] font-medium text-warning bg-surface/80 px-2 py-0.5 rounded-md">
              Results
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
