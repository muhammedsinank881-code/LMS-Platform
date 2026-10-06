import { AlertTriangle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, ProgressBar } from '@/components/ui'
import { formatINR } from '@/lib/format'
import { budgetUsage, pacingStatus, projectSpend, type PacingStatus } from '@/lib/metrics'
import type { Campaign } from '@/types'
import { Restricted } from '../MetricCells'

const PACING_TEXT: Record<PacingStatus, string> = {
  under: 'on pace to underspend',
  on_track: 'on track for the budget',
  over: 'on pace to overspend',
}

/** Spent against budget over the whole campaign, with a projection to the end date. */
export function BudgetProgress({
  campaign,
  spent,
  hidden,
  now = new Date(),
}: {
  campaign: Campaign
  /** All-time spend. Null when the role cannot see spend. */
  spent: number | null
  hidden: boolean
  now?: Date
}) {
  if (hidden || spent === null) {
    return (
      <Card size="sm" className="min-w-0">
        <CardHeader><CardTitle>Budget</CardTitle></CardHeader>
        <CardContent><Restricted /></CardContent>
      </Card>
    )
  }
  const usage = budgetUsage(spent, campaign.budget)
  const projected = projectSpend(spent, campaign.startDate, campaign.endDate, now)
  const pacing = pacingStatus(projected, campaign.budget)
  const percent = usage.percent === null ? null : Math.round(usage.percent)
  const tone = usage.state === 'over' ? 'destructive' : usage.state === 'warning' ? 'warning' : 'primary'
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader><CardTitle>Budget</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <ProgressBar
          value={usage.percent === null ? null : Math.min(usage.percent, 100)}
          tone={tone}
          size="lg"
          aria-label={`Budget used: ${percent ?? 0}%`}
        />
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="text-lg font-semibold tabular-nums">{formatINR(spent)}</span>
          <span className="text-muted-foreground">of {formatINR(campaign.budget)}</span>
          {percent !== null ? <span className="tabular-nums text-muted-foreground">({percent}%)</span> : null}
        </p>
        {usage.state === 'over' ? (
          <p role="status" className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            Over budget by {formatINR(spent - campaign.budget)}.
          </p>
        ) : usage.state === 'warning' ? (
          <p role="status" className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            Warning: more than 80% of the budget is used.
          </p>
        ) : null}
        {projected !== null && pacing ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 shrink-0" aria-hidden="true" />
            Projected {formatINR(projected)} by the end date: {PACING_TEXT[pacing]}.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No end date, so no projection.</p>
        )}
      </CardContent>
    </Card>
  )
}
