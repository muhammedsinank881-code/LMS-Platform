import { useNavigate } from 'react-router-dom'
import { AreaChartCard, BarChartCard } from '@/components/common/charts/lazy-charts'
import { StatCard } from '@/components/common/StatCard'
import { usePipelines } from '@/features/pipeline/hooks/use-pipelines'
import { compareCaption } from '@/lib/date-range'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { useDashboardSummary } from '@/features/dashboard/hooks/use-dashboard'
import { formatCount, formatPercent, moneyPair } from '@/features/dashboard/lib/format-metric'
import { dealStageHref, stageTypeHref } from '@/features/dashboard/lib/links'
import { useFollowUpMetrics, usePipelineReport, useRevenueOverTime, useWinLoss } from '../hooks/use-reports'

export function SalesReportTab({ state }: { state: DateRangeState }) {
  const navigate = useNavigate()
  const summary = useDashboardSummary(state.query)
  const revenue = useRevenueOverTime(state.query)
  const pipeline = usePipelineReport(state.query)
  const winLoss = useWinLoss(state.query)
  const metrics = useFollowUpMetrics(state.query)
  const pipelines = usePipelines()
  const names = new Map((pipelines.data ?? []).flatMap((board) => board.stages.map((stage) => [stage.id, stage.name])))
  const caption = compareCaption(state.preset)
  const revenuePair = moneyPair(summary.data?.revenue.value ?? 0)
  const pipelinePair = moneyPair(summary.data?.pipelineValue.value ?? 0)
  const weightedPair = moneyPair(summary.data?.weightedPipeline.value ?? 0)
  const avg = pipeline.data && pipeline.data.count > 0 ? pipeline.data.total / pipeline.data.count : null

  return (
    <div className="min-w-0 space-y-3">
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <li><StatCard label="Revenue" value={revenuePair.compact} hint={revenuePair.full} delta={summary.data?.revenue.delta ?? null} caption={caption} to={stageTypeHref('won')} isLoading={summary.isLoading} isError={summary.isError} onRetry={() => void summary.refetch()} /></li>
        <li><StatCard label="Win rate" value={formatPercent(winLoss.data?.winRate.value ?? null)} delta={winLoss.data?.winRate.delta ?? null} caption={caption} isLoading={winLoss.isLoading} isError={winLoss.isError} onRetry={() => void winLoss.refetch()} /></li>
        <li><StatCard label="Conversion rate" value={formatPercent(summary.data?.conversionRate.value ?? null)} delta={summary.data?.conversionRate.delta ?? null} caption={caption} isLoading={summary.isLoading} isError={summary.isError} onRetry={() => void summary.refetch()} /></li>
        <li><StatCard label="Average deal value" value={avg === null ? '—' : moneyPair(avg).compact} hint={avg === null ? undefined : moneyPair(avg).full} delta={null} caption={caption} isLoading={pipeline.isLoading} isError={pipeline.isError} onRetry={() => void pipeline.refetch()} /></li>
        <li><StatCard label="Weighted pipeline" value={weightedPair.compact} hint={weightedPair.full} delta={summary.data?.weightedPipeline.delta ?? null} caption={caption} to={stageTypeHref('open')} isLoading={summary.isLoading} isError={summary.isError} onRetry={() => void summary.refetch()} /></li>
        <li><StatCard label="Pipeline value" value={pipelinePair.compact} hint={pipelinePair.full} delta={summary.data?.pipelineValue.delta ?? null} caption={caption} to={stageTypeHref('open')} isLoading={summary.isLoading} isError={summary.isError} onRetry={() => void summary.refetch()} /></li>
      </ul>
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-2 lg:[&>*:last-child:nth-child(odd)]:col-span-2">
        <AreaChartCard
          title="Revenue over time"
          points={(revenue.data?.points ?? []).map((point, index) => ({
            label: point.date.slice(5),
            value: point.revenue,
            previous: revenue.data?.previous?.[index]?.revenue ?? null,
          }))}
          valueLabel="Revenue"
          isLoading={revenue.isLoading}
          isError={revenue.isError}
          onRetry={() => void revenue.refetch()}
        />
        <BarChartCard
          title="Pipeline by stage"
          points={(pipeline.data?.byStage ?? []).map((stage) => ({
            key: stage.stageId,
            label: names.get(stage.stageId) ?? stage.stageId,
            value: stage.total,
          }))}
          valueLabel="Value"
          isLoading={pipeline.isLoading}
          isError={pipeline.isError}
          onRetry={() => void pipeline.refetch()}
          onSelect={(id) => navigate(dealStageHref(id))}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {formatCount(summary.data?.won.value ?? 0)} won · avg response {metrics.data?.avgResponseTimeMins === null || metrics.data?.avgResponseTimeMins === undefined ? '—' : `${Math.round(metrics.data.avgResponseTimeMins)} min`}
      </p>
    </div>
  )
}
