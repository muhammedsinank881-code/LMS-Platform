import { Link } from 'react-router-dom'
import { FunnelChart } from '@/components/common/charts/FunnelChart'
import { AreaChartCard, BarChartCard } from '@/components/common/charts/lazy-charts'
import { Card, CardContent, CardHeader, CardTitle, EmptyState } from '@/components/ui'
import { moneyPair } from '@/features/dashboard/lib/format-metric'
import { formatDateTime } from '@/lib/format'
import type { RepDetail } from '@/types'

interface Frame {
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function RepCharts({ detail, ...frame }: { detail: RepDetail | undefined } & Frame) {
  const activity = (detail?.activityOverTime ?? []).map((day) => ({
    label: day.date.slice(5),
    value: day.calls + day.messages + day.emails + day.notes,
  }))
  const totals = (detail?.activityOverTime ?? []).reduce(
    (sum, day) => ({ calls: sum.calls + day.calls, messages: sum.messages + day.messages, emails: sum.emails + day.emails, notes: sum.notes + day.notes }),
    { calls: 0, messages: 0, emails: 0, notes: 0 },
  )
  return (
    <div className="grid min-w-0 gap-3 lg:grid-cols-2">
      <FunnelChart
        title="Deal funnel"
        steps={(detail?.funnel ?? []).map((stage) => ({
          key: stage.stageId,
          label: stage.name,
          count: stage.count,
          valueLabel: moneyPair(stage.value).compact,
          conversionFromPrevious: stage.conversionFromPrevious,
        }))}
        {...frame}
      />
      <AreaChartCard
        title="Activity over time"
        subtitle={`${totals.calls} calls · ${totals.messages} messages · ${totals.emails} emails · ${totals.notes} notes`}
        points={activity}
        valueLabel="Activities"
        {...frame}
      />
      <AreaChartCard
        title="Response time trend"
        subtitle="Average first response (minutes) by lead creation day"
        points={(detail?.responseTrend ?? []).map((p) => ({ label: p.date.slice(5), value: Math.round(p.value) }))}
        valueLabel="Minutes"
        {...frame}
      />
      <BarChartCard
        title="Lead aging"
        subtitle="Open leads by days since last contact"
        layout="vertical"
        points={(detail?.leadAging ?? []).map((b) => ({ key: b.label, label: b.label, value: b.count }))}
        valueLabel="Open leads"
        {...frame}
      />
      <BarChartCard
        title="Lost reasons"
        points={(detail?.lostReasons ?? []).map((r) => ({ key: r.key, label: r.label, value: r.count }))}
        valueLabel="Leads"
        {...frame}
      />
      <Card size="sm" className="min-w-0">
        <CardHeader><CardTitle>Open follow-ups</CardTitle></CardHeader>
        <CardContent>
          {(detail?.backlog.length ?? 0) === 0 ? (
            <EmptyState size="sm" title="No open follow-ups" description="Nothing is due in the next week." />
          ) : (
            <ul className="divide-y divide-border">
              {(detail?.backlog ?? []).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <Link to={`/leads/${item.leadId}`} className="truncate font-medium hover:underline">{item.leadName}</Link>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.type} · {formatDateTime(item.dueAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
