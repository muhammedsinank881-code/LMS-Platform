import { BarChartCard } from '@/components/common/charts/lazy-charts'
import { QueryState } from '@/components/common/QueryState'
import { StatCard } from '@/components/common/StatCard'
import { Skeleton } from '@/components/ui'
import { formatPercent } from '@/features/dashboard/lib/format-metric'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { RESPONSE_BUCKET_LABELS } from '@/lib/metrics'
import { useResponseFollowUp } from '../../hooks/use-advanced-reports'
import { ResponseDistribution } from './ResponseDistribution'

export function ResponseFollowUpTab({ state }: { state: DateRangeState }) {
  const report = useResponseFollowUp(state.query)
  const data = report.data
  const retry = () => void report.refetch()
  return (
    <div className="min-w-0 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Follow-up completion"
          value={formatPercent(data?.followUpCompletionRate ?? null)}
          delta={null}
          caption=""
          isLoading={report.isLoading}
          isError={report.isError}
          onRetry={retry}
        />
        <StatCard
          label="Missed follow-ups"
          value={String(data?.missedFollowUps ?? 0)}
          hint="Follow-ups due in this period that were never completed"
          delta={null}
          caption=""
          lowerIsBetter
          to="/follow-ups?bucket=overdue"
          isLoading={report.isLoading}
          isError={report.isError}
          onRetry={retry}
        />
      </div>
      <BarChartCard
        title="Speed to lead vs conversion"
        subtitle="Share of leads won, by how fast they got a first response"
        layout="vertical"
        points={(data?.speedToLead ?? []).map((p) => ({
          key: p.bucket,
          label: `${RESPONSE_BUCKET_LABELS[p.bucket]} (${p.leads})`,
          value: Math.round(p.conversionRate ?? 0),
        }))}
        valueLabel="Conversion %"
        isLoading={report.isLoading}
        isError={report.isError}
        onRetry={retry}
      />
      <QueryState isLoading={report.isLoading} isError={report.isError} onRetry={retry} loading={<Skeleton className="h-40 w-full" />}>
        <div className="grid min-w-0 gap-3 lg:grid-cols-2">
          <ResponseDistribution title="Response time by source" description="First response after a lead arrived." rows={data?.bySource ?? []} />
          <ResponseDistribution title="Response time by rep" description="Reps in your data scope." rows={data?.byRep ?? []} />
        </div>
      </QueryState>
    </div>
  )
}
