import { useNavigate } from 'react-router-dom'
import { AreaChartCard, BarChartCard } from '@/components/common/charts/lazy-charts'
import { leadFieldHref } from '@/features/dashboard/lib/links'
import { formatPercent } from '@/features/dashboard/lib/format-metric'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { useLostAnalysis } from '../hooks/use-reports'
import { BreakdownTable } from './BreakdownTable'

export function LostReportTab({ state }: { state: DateRangeState }) {
  const navigate = useNavigate()
  const lost = useLostAnalysis(state.query)
  const reasons = (lost.data?.reasons ?? []).map((row) => ({ ...row, count: row.count }))
  return (
    <div className="min-w-0 space-y-3">
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-2 lg:[&>*:last-child:nth-child(odd)]:col-span-2">
        <BarChartCard
          title="Lost reasons"
          points={(lost.data?.reasons ?? []).map((row) => ({ key: row.key, label: `${row.label} (${formatPercent(row.percent)})`, value: row.count }))}
          valueLabel="Leads"
          isLoading={lost.isLoading}
          isError={lost.isError}
          onRetry={() => void lost.refetch()}
        />
        <BreakdownTable rows={reasons} onSelect={() => navigate('/leads')} />
        <BarChartCard
          title="Lost by source"
          points={(lost.data?.bySource ?? []).map((row) => ({ key: row.key, label: row.label, value: row.count }))}
          valueLabel="Leads"
          isLoading={lost.isLoading}
          isError={lost.isError}
          onRetry={() => void lost.refetch()}
          onSelect={(id) => navigate(leadFieldHref('sourceId', id))}
        />
        <BarChartCard
          title="Lost by salesperson"
          points={(lost.data?.bySalesperson ?? []).map((row) => ({ key: row.key, label: row.label, value: row.count }))}
          valueLabel="Leads"
          isLoading={lost.isLoading}
          isError={lost.isError}
          onRetry={() => void lost.refetch()}
          onSelect={(id) => navigate(leadFieldHref('assignedTo', id))}
        />
      </div>
      <AreaChartCard
        title="Lost over time"
        points={(lost.data?.trend ?? []).map((point, index) => ({
          label: point.date.slice(5),
          value: point.count,
          previous: lost.data?.previousTrend?.[index]?.count ?? null,
        }))}
        valueLabel="Lost"
        isLoading={lost.isLoading}
        isError={lost.isError}
        onRetry={() => void lost.refetch()}
      />
    </div>
  )
}
