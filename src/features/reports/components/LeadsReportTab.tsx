import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChartCard, BarChartCard } from '@/components/common/charts/lazy-charts'
import { Select } from '@/components/ui'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { groupSeries } from '@/lib/metrics'
import { BREAKDOWN_DIMENSIONS, type BreakdownDimension } from '@/types'
import { useBreakdown, useLeadsOverTime } from '../hooks/use-reports'
import { leadFieldHref } from '@/features/dashboard/lib/links'
import { BreakdownTable } from './BreakdownTable'

const DIMENSION_FIELD = {
  source: 'sourceId',
  status: 'statusId',
  campaign: 'campaignId',
  location: 'location',
  salesperson: 'assignedTo',
} as const

const LABELS: Record<BreakdownDimension, string> = {
  source: 'Source',
  status: 'Status',
  campaign: 'Campaign',
  location: 'Location',
  salesperson: 'Salesperson',
}

export function LeadsReportTab({ state }: { state: DateRangeState }) {
  const navigate = useNavigate()
  const breakdown = useBreakdown(state.query, state.dimension)
  const series = useLeadsOverTime(state.query)
  const points = useMemo(() => {
    const grouped = groupSeries(
      series.data?.points ?? [],
      state.granularity,
      (point) => point.count,
      (date, count) => ({ date, count }),
    )
    return grouped.map((point, index) => ({
      label: point.date.slice(5),
      value: point.count,
      previous: series.data?.previous ? groupSeries(series.data.previous, state.granularity, (item) => item.count, (date, count) => ({ date, count }))[index]?.count ?? null : null,
    }))
  }, [series.data, state.granularity])
  const field = DIMENSION_FIELD[state.dimension]
  const open = (key: string) => navigate(leadFieldHref(field, key))

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap gap-2 print:hidden">
        <Select
          className="w-[calc(50%-0.25rem)] sm:w-40"
          aria-label="Dimension"
          value={state.dimension}
          onValueChange={(value) => state.setDimension(value as BreakdownDimension)}
          options={BREAKDOWN_DIMENSIONS.map((item) => ({ value: item, label: LABELS[item] }))}
        />
        <Select
          className="w-[calc(50%-0.25rem)] sm:w-40"
          aria-label="Group by"
          value={state.granularity}
          onValueChange={(value) => state.setGranularity(value as DateRangeState['granularity'])}
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
        />
      </div>
      <AreaChartCard
        title="Leads over time"
        points={points}
        valueLabel="Leads"
        isLoading={series.isLoading}
        isError={series.isError}
        onRetry={() => void series.refetch()}
      />
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-2 lg:[&>*:last-child:nth-child(odd)]:col-span-2">
        <BarChartCard
          title={`Leads by ${LABELS[state.dimension].toLowerCase()}`}
          points={(breakdown.data?.rows ?? []).map((row) => ({ key: row.key, label: row.label, value: row.count }))}
          valueLabel="Leads"
          isLoading={breakdown.isLoading}
          isError={breakdown.isError}
          onRetry={() => void breakdown.refetch()}
          onSelect={open}
        />
        <BreakdownTable rows={breakdown.data?.rows ?? []} onSelect={open} />
      </div>
    </div>
  )
}
