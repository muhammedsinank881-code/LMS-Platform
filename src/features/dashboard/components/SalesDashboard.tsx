import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChartCard } from '@/components/common/charts/lazy-charts'
import { useFollowUpSummary } from '@/features/followups/hooks/use-followup-summary'
import { usePipelines } from '@/features/pipeline/hooks/use-pipelines'
import { usePipelineReport } from '@/features/reports/hooks/use-reports'
import type { RangePreset } from '@/lib/date-range'
import type { ReportQuery } from '@/types'
import { useDashboardSummary } from '../hooks/use-dashboard'
import { formatCount, moneyPair } from '../lib/format-metric'
import { OVERDUE_FOLLOWUPS, TODAY_FOLLOWUPS, createdHref, dealStageHref, hotLeadsHref, stageTypeHref } from '../lib/links'
import { CallListCard } from './CallListCard'
import { KpiGrid } from './KpiGrid'
import { RecentActivityCard } from './RecentActivityCard'
import { TodayFollowUps } from './TodayFollowUps'

export function SalesDashboard({ query, preset }: { query: ReportQuery; preset: RangePreset }) {
  const summary = useDashboardSummary(query)
  const pipeline = usePipelineReport(query)
  const pipelines = usePipelines()
  const followUps = useFollowUpSummary('mine')
  const navigate = useNavigate()
  const data = summary.data
  const revenue = moneyPair(data?.revenue.value ?? 0)
  const stageName = useMemo(() => {
    const names = new Map<string, string>()
    for (const board of pipelines.data ?? []) {
      for (const stage of board.stages) names.set(stage.id, stage.name)
    }
    return names
  }, [pipelines.data])

  return (
    <div className="min-w-0 space-y-3">
      <KpiGrid
        preset={preset}
        isLoading={summary.isLoading || followUps.isLoading}
        isError={summary.isError}
        onRetry={() => void summary.refetch()}
        items={[
          { label: 'My leads', kpi: data?.openLeads, display: formatCount(data?.openLeads.value ?? 0), to: '/leads' },
          { label: 'New leads', kpi: data?.newLeads, display: formatCount(data?.newLeads.value ?? 0), to: createdHref(query.range) },
          { label: "Today's follow-ups", display: formatCount(followUps.today), delta: null, to: TODAY_FOLLOWUPS },
          { label: 'Overdue', display: formatCount(followUps.overdue), delta: null, to: OVERDUE_FOLLOWUPS, lowerIsBetter: true },
          { label: 'Hot leads', kpi: data?.hotLeads, display: formatCount(data?.hotLeads.value ?? 0), to: hotLeadsHref() },
          { label: 'Won', kpi: data?.won, display: formatCount(data?.won.value ?? 0), to: stageTypeHref('won') },
          { label: 'Revenue', kpi: data?.revenue, display: revenue.compact, hint: revenue.full, to: stageTypeHref('won') },
        ]}
      />
      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 lg:[&>*:last-child:nth-child(odd)]:col-span-2">
        <CallListCard query={query} />
        <TodayFollowUps />
        <BarChartCard
          title="My pipeline"
          points={(pipeline.data?.byStage ?? []).map((stage) => ({
            key: stage.stageId,
            label: stageName.get(stage.stageId) ?? stage.stageId,
            value: stage.count,
          }))}
          valueLabel="Deals"
          isLoading={pipeline.isLoading}
          isError={pipeline.isError}
          onRetry={() => void pipeline.refetch()}
          onSelect={(id) => navigate(dealStageHref(id))}
        />
        <RecentActivityCard query={query} />
      </div>
    </div>
  )
}
