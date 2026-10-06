import { BarChartCard } from '@/components/common/charts/lazy-charts'
import { QueryState } from '@/components/common/QueryState'
import { ReportTable, type ReportColumn } from '@/components/common/ReportTable'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { formatINR } from '@/lib/format'
import { BEST_MIN_PROBABILITY, COMMIT_MIN_PROBABILITY } from '@/lib/metrics'
import type { ForecastMonth } from '@/types'
import { useForecast } from '../../hooks/use-advanced-reports'

const COLUMNS: ReportColumn<ForecastMonth>[] = [
  { id: 'month', header: 'Expected close', cell: (r) => r.month },
  { id: 'deals', header: 'Deals', align: 'right', cell: (r) => r.deals },
  { id: 'worst', header: 'Worst case', align: 'right', cell: (r) => formatINR(r.worst) },
  { id: 'weighted', header: 'Weighted', align: 'right', cell: (r) => formatINR(r.weighted) },
  { id: 'commit', header: 'Commit', align: 'right', cell: (r) => formatINR(r.commit) },
  { id: 'best', header: 'Best case', align: 'right', cell: (r) => formatINR(r.best) },
]

export function ForecastTab({ state }: { state: DateRangeState }) {
  const report = useForecast(state.query)
  const data = report.data
  const retry = () => void report.refetch()
  const total = (value: number | undefined) => formatINR(value ?? 0)
  return (
    <div className="min-w-0 space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(
          [
            ['Worst case', data?.totals.worst, 'Commit deals, probability-weighted'],
            ['Weighted pipeline', data?.totals.weighted, 'Every open deal at its stage probability'],
            ['Commit', data?.totals.commit, `Deals at ${COMMIT_MIN_PROBABILITY}% or more, at full value`],
            ['Best case', data?.totals.best, `Deals at ${BEST_MIN_PROBABILITY}% or more, at full value`],
          ] as const
        ).map(([label, value, hint]) => (
          <StatCard key={label} label={label} value={total(value)} hint={hint} delta={null} caption="" isLoading={report.isLoading} isError={report.isError} onRetry={retry} />
        ))}
      </div>
      <BarChartCard
        title="Weighted pipeline by expected close month"
        layout="vertical"
        points={(data?.months ?? []).map((m) => ({ key: m.month, label: m.month, value: Math.round(m.weighted) }))}
        valueLabel="Weighted value (INR)"
        isLoading={report.isLoading}
        isError={report.isError}
        onRetry={retry}
      />
      <Card size="sm" className="min-w-0">
        <CardHeader>
          <CardTitle>Forecast ranges</CardTitle>
          <CardDescription>
            Rule-based, from stage probabilities: worst ≤ commit ≤ best. This is not an AI prediction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QueryState isLoading={report.isLoading} isError={report.isError} onRetry={retry} isEmpty={(data?.months.length ?? 0) === 0} emptyTitle="No open deals to forecast">
            <ReportTable caption="Forecast by expected close month" columns={COLUMNS} rows={data?.months ?? []} getKey={(r) => r.month} />
          </QueryState>
        </CardContent>
      </Card>
    </div>
  )
}
