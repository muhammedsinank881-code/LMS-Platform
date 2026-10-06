import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { useAutomationStats } from '../hooks/use-automations'

/** Runs, success rate and the busiest automations over the last 30 days. Shown to roles that can view automations. */
export function AutomationActivityCard() {
  const { can } = usePermission()
  const stats = useAutomationStats()
  if (!can('automations', 'view')) return null
  const data = stats.data
  return (
    <Card size="sm" className="h-full w-full">
      <CardHeader>
        <CardTitle>Automation activity</CardTitle>
        <p className="text-xs text-muted-foreground">Last 30 days</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.isLoading ? <Skeleton className="h-32 w-full" /> : null}
        {stats.isError ? (
          <EmptyState size="sm" tone="destructive" icon={AlertTriangle} title="Could not load automation activity" action={<Button size="sm" variant="outline" onClick={() => void stats.refetch()}>Retry</Button>} />
        ) : null}
        {data && data.runs === 0 ? <EmptyState size="sm" title="No automation runs yet" description="Runs show up here once an automation fires." /> : null}
        {data && data.runs > 0 ? (
          <>
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div>
                <dd className="text-xl font-semibold tabular-nums">{data.runs}</dd>
                <dt className="text-xs text-muted-foreground">Runs</dt>
              </div>
              <div>
                <dd className="text-xl font-semibold tabular-nums">{data.successRate === null ? '—' : `${Math.round(data.successRate * 100)}%`}</dd>
                <dt className="text-xs text-muted-foreground">Success rate</dt>
              </div>
              <div>
                <dd className="text-xl font-semibold tabular-nums">{data.failed}</dd>
                <dt className="text-xs text-muted-foreground">Failed</dt>
              </div>
            </dl>
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Top automations</h4>
              <ol className="space-y-1">
                {data.top.map((item) => (
                  <li key={item.automationId} className="flex items-center justify-between gap-2 text-sm">
                    <Link className="truncate hover:underline" to={`/automations/${item.automationId}`}>
                      {item.name}
                    </Link>
                    <span className="tabular-nums text-muted-foreground">{item.runs} runs</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : null}
        <Link className="inline-block text-sm text-primary hover:underline" to="/automations?tab=runs">
          View all runs
        </Link>
      </CardContent>
    </Card>
  )
}
