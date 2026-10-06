import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChartCard, BarChartCard, DonutChartCard } from '@/components/common/charts/lazy-charts'
import { FunnelChart } from '@/components/common/charts/FunnelChart'
import { AutomationActivityCard } from '@/features/automations/components/AutomationActivityCard'
import { LeaderboardWidget } from '@/features/reports/components/performance/LeaderboardWidget'
import { useFollowUpSummary } from '@/features/followups/hooks/use-followup-summary'
import {
  useBreakdown,
  useFollowUpMetrics,
  useFunnel,
  useLeadsOverTime,
  useLostAnalysis,
} from '@/features/reports/hooks/use-reports'
import type { RangePreset } from '@/lib/date-range'
import type { ReportQuery } from '@/types'
import { useDashboardSummary } from '../hooks/use-dashboard'
import { formatCount, formatPercent, moneyPair } from '../lib/format-metric'
import {
  OVERDUE_FOLLOWUPS,
  createdHref,
  dealStageHref,
  leadFieldHref,
  qualifiedHref,
  stageTypeHref,
} from '../lib/links'
import { KpiGrid } from './KpiGrid'
import { RecentActivityCard } from './RecentActivityCard'

export function ManagerDashboard({
  query,
  preset,
  showTeam,
}: {
  query: ReportQuery
  preset: RangePreset
  showTeam: boolean
}) {
  const navigate = useNavigate()
  const summary = useDashboardSummary(query)
  const series = useLeadsOverTime(query)
  const sources = useBreakdown(query, 'source')
  const funnel = useFunnel(query)
  const lost = useLostAnalysis(query)
  const followUps = useFollowUpMetrics(query)
  const buckets = useFollowUpSummary('team')
  const data = summary.data
  const pipeline = moneyPair(data?.pipelineValue.value ?? 0)
  const weighted = moneyPair(data?.weightedPipeline.value ?? 0)
  const revenue = moneyPair(data?.revenue.value ?? 0)
  const points = useMemo(
    () =>
      (series.data?.points ?? []).map((point, index) => ({
        label: point.date.slice(5),
        value: point.count,
        previous: series.data?.previous?.[index]?.count ?? null,
      })),
    [series.data],
  )

  return (
    <div className="min-w-0 space-y-3">
      <KpiGrid
        preset={preset}
        isLoading={summary.isLoading}
        isError={summary.isError}
        onRetry={() => void summary.refetch()}
        items={[
          { label: 'Total leads', kpi: data?.totalLeads, display: formatCount(data?.totalLeads.value ?? 0), to: '/leads' },
          { label: 'Qualified', kpi: data?.qualified, display: formatCount(data?.qualified.value ?? 0), to: qualifiedHref(query.range) },
          { label: 'Open deals', kpi: data?.openDeals, display: formatCount(data?.openDeals.value ?? 0), to: stageTypeHref('open') },
          { label: 'Won', kpi: data?.won, display: formatCount(data?.won.value ?? 0), to: stageTypeHref('won') },
          { label: 'Lost', kpi: data?.lost, display: formatCount(data?.lost.value ?? 0), to: stageTypeHref('lost'), lowerIsBetter: true },
          { label: 'Pipeline value', kpi: data?.pipelineValue, display: pipeline.compact, hint: pipeline.full, to: stageTypeHref('open') },
          { label: 'Weighted pipeline', kpi: data?.weightedPipeline, display: weighted.compact, hint: weighted.full, to: stageTypeHref('open') },
          { label: 'Revenue', kpi: data?.revenue, display: revenue.compact, hint: revenue.full, to: stageTypeHref('won') },
          { label: 'Conversion rate', kpi: data?.conversionRate, display: formatPercent(data?.conversionRate.value ?? null), to: createdHref(query.range) },
        ]}
      />
      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 lg:[&>*:last-child:nth-child(odd)]:col-span-2">
        <AreaChartCard
          title="Leads over time"
          points={points}
          valueLabel="Leads"
          isLoading={series.isLoading}
          isError={series.isError}
          onRetry={() => void series.refetch()}
        />
        <DonutChartCard
          title="Leads by source"
          slices={(sources.data?.rows ?? []).map((row) => ({ key: row.key, label: row.label, value: row.count }))}
          isLoading={sources.isLoading}
          isError={sources.isError}
          onRetry={() => void sources.refetch()}
          onSelect={(id) => navigate(leadFieldHref('sourceId', id))}
        />
        <FunnelChart
          title="Funnel by stage"
          steps={(funnel.data ?? []).map((stage) => ({
            key: stage.stageId,
            label: stage.name,
            count: stage.count,
            valueLabel: moneyPair(stage.value).compact,
            conversionFromPrevious: stage.conversionFromPrevious,
          }))}
          isLoading={funnel.isLoading}
          isError={funnel.isError}
          onRetry={() => void funnel.refetch()}
          onSelect={(id) => navigate(dealStageHref(id))}
        />
        <BarChartCard
          title="Lost reasons"
          points={(lost.data?.reasons ?? []).map((row) => ({ key: row.key, label: row.label, value: row.count }))}
          valueLabel="Leads"
          isLoading={lost.isLoading}
          isError={lost.isError}
          onRetry={() => void lost.refetch()}
        />
        {showTeam ? <LeaderboardWidget query={{ range: query.range, teamId: query.teamId }} /> : null}
        <BarChartCard
          title="Overdue follow-ups"
          subtitle={`${formatCount(buckets.overdue)} open`}
          points={(followUps.data?.overdueBySalesperson ?? []).map((row) => ({ key: row.key, label: row.label, value: row.count }))}
          valueLabel="Overdue"
          isLoading={followUps.isLoading}
          isError={followUps.isError}
          onRetry={() => void followUps.refetch()}
          onSelect={() => navigate(OVERDUE_FOLLOWUPS)}
        />
        <AutomationActivityCard />
        <RecentActivityCard query={query} />
      </div>
    </div>
  )
}
