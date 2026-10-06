import { ArrowDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton, Button } from '@/components/ui'
import { formatINR } from '@/lib/format'
import type { FunnelStep } from '@/types'
import { Restricted } from '../MetricCells'

const MONEY = new Set(['Spend', 'Revenue'])

/** Spend → Leads → Qualified → Deals → Revenue, with the share that made it to each next step. */
export function CampaignFunnelCard({
  steps,
  isLoading,
  isError,
  onRetry,
  spendHidden,
}: {
  steps: FunnelStep[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  spendHidden: boolean
}) {
  const counts = (steps ?? []).filter((s) => !MONEY.has(s.label)).map((s) => s.value ?? 0)
  const max = Math.max(1, ...counts)
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader><CardTitle>Funnel</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-52 w-full" /> : null}
        {isError ? (
          <EmptyState size="sm" tone="destructive" title="Could not load the funnel" action={<Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>} />
        ) : null}
        {steps && !isLoading && !isError ? (
          <ol className="space-y-0.5">
            {steps.map((step, index) => {
              const isMoney = MONEY.has(step.label)
              const value = step.value
              return (
                <li key={step.label}>
                  {index > 0 ? (
                    <p className="flex items-center gap-1 pl-1 text-[11px] leading-4 text-muted-foreground">
                      <ArrowDown className="h-3 w-3" aria-hidden="true" />
                      {step.conversionFromPrevious === null ? 'No step conversion' : `${step.conversionFromPrevious.toFixed(1)}% continue`}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-sm">{step.label}</span>
                    {isMoney ? (
                      <span className="text-sm font-semibold tabular-nums">
                        {spendHidden ? <Restricted /> : value === null ? '—' : formatINR(value)}
                      </span>
                    ) : (
                      <>
                        <span className="h-5 min-w-0 flex-1 rounded-sm bg-muted" aria-hidden="true">
                          <span className="block h-5 rounded-sm bg-primary/80" style={{ width: `${Math.max(3, ((value ?? 0) / max) * 100)}%` }} />
                        </span>
                        <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">{value ?? 0}</span>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        ) : null}
      </CardContent>
    </Card>
  )
}
