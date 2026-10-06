import { BarChartCard } from '@/components/common/charts/lazy-charts'
import { QueryState } from '@/components/common/QueryState'
import { ReportTable, type ReportColumn } from '@/components/common/ReportTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { EMPTY_VALUE } from '@/lib/format/shared'
import type { StageVelocityRow } from '@/types'
import { useFunnelVelocity } from '../../hooks/use-advanced-reports'
import { CohortTable } from './CohortTable'
import { StuckDealsTable } from './StuckDealsTable'

const COLUMNS: ReportColumn<StageVelocityRow>[] = [
  { id: 'name', header: 'Stage', cell: (r) => r.name },
  { id: 'count', header: 'Deals', align: 'right', cell: (r) => r.count },
  { id: 'conv', header: 'From previous stage', align: 'right', cell: (r) => (r.conversionFromPrevious === null ? EMPTY_VALUE : `${r.conversionFromPrevious.toFixed(0)}%`) },
  { id: 'days', header: 'Avg days in stage', align: 'right', cell: (r) => (r.avgDaysInStage === null ? EMPTY_VALUE : r.avgDaysInStage.toFixed(1)) },
]

export function FunnelVelocityTab({ state }: { state: DateRangeState }) {
  const report = useFunnelVelocity(state.query, state.stuckDays)
  const data = report.data
  const retry = () => void report.refetch()
  return (
    <div className="min-w-0 space-y-3">
      <div className="grid min-w-0 gap-3 lg:grid-cols-2">
        <Card size="sm" className="min-w-0">
          <CardHeader><CardTitle>Stage-to-stage conversion</CardTitle></CardHeader>
          <CardContent>
            <QueryState isLoading={report.isLoading} isError={report.isError} onRetry={retry} isEmpty={(data?.stages.length ?? 0) === 0} emptyTitle="No pipeline data">
              <ReportTable caption="Deals, conversion and average days per stage" columns={COLUMNS} rows={data?.stages ?? []} getKey={(r) => r.stageId} />
            </QueryState>
          </CardContent>
        </Card>
        <BarChartCard
          title="Time to close"
          subtitle={data?.avgDaysToClose == null ? 'Days from creation to won' : `Average ${data.avgDaysToClose} days from creation to won`}
          layout="vertical"
          points={(data?.timeToClose ?? []).map((bin) => ({ key: bin.label, label: bin.label, value: bin.count }))}
          valueLabel="Won deals"
          isLoading={report.isLoading}
          isError={report.isError}
          onRetry={retry}
        />
      </div>
      <StuckDealsTable
        deals={data?.stuck ?? []}
        days={state.stuckDays}
        onDaysChange={state.setStuckDays}
        isLoading={report.isLoading}
        isError={report.isError}
        onRetry={retry}
      />
      <CohortTable rows={data?.cohorts ?? []} isLoading={report.isLoading} isError={report.isError} onRetry={retry} />
    </div>
  )
}
