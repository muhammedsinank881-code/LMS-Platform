import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChartCard, BarChartCard, DonutChartCard } from '@/components/common/charts/lazy-charts'
import { QueryState } from '@/components/common/QueryState'
import { Select } from '@/components/ui'
import { Restricted } from '@/features/campaigns/components/MetricCells'
import { leadFieldHref } from '@/features/dashboard/lib/links'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { useAttribution, useCampaignReport, useSpendVsRevenue } from '../../hooks/use-advanced-reports'
import { AttributionTable } from './AttributionTable'
import { CampaignPerformanceTable, type PerformanceRow } from './CampaignPerformanceTable'

type Metric = 'roas' | 'cpl' | 'cac' | 'costPerQualified'
const METRICS: Array<{ value: Metric; label: string; lowerIsBetter: boolean }> = [
  { value: 'roas', label: 'ROAS (higher is better)', lowerIsBetter: false },
  { value: 'cpl', label: 'CPL (lower is better)', lowerIsBetter: true },
  { value: 'cac', label: 'CAC (lower is better)', lowerIsBetter: true },
  { value: 'costPerQualified', label: 'Cost per qualified lead (lower is better)', lowerIsBetter: true },
]
const VIEWS = [
  { value: 'campaign', label: 'By campaign' },
  { value: 'platform', label: 'By platform' },
  { value: 'adset', label: 'By ad set' },
  { value: 'ad', label: 'By ad' },
] as const

export function CampaignsReportTab({ state }: { state: DateRangeState }) {
  const navigate = useNavigate()
  const report = useCampaignReport(state.query)
  const spend = useSpendVsRevenue(state.query)
  const attribution = useAttribution(state.query, state.attribution)
  const [metric, setMetric] = useState<Metric>('roas')
  const hidden = report.data?.spendHidden ?? false
  const meta = METRICS.find((m) => m.value === metric) ?? METRICS[0]

  const rows: PerformanceRow[] = useMemo(() => {
    const data = report.data
    if (!data) return []
    if (state.campaignView === 'platform') {
      return data.platforms.map((p) => ({ ...p, id: p.key, name: p.label, platform: 'other' as const }))
    }
    if (state.campaignView === 'adset') return data.adSets
    if (state.campaignView === 'ad') return data.ads
    return data.campaigns
  }, [report.data, state.campaignView])

  const ranking = useMemo(() => {
    const ranked = (report.data?.campaigns ?? []).filter((row) => row[metric] !== null)
    ranked.sort((a, b) => (meta.lowerIsBetter ? (a[metric] ?? 0) - (b[metric] ?? 0) : (b[metric] ?? 0) - (a[metric] ?? 0)))
    return ranked.slice(0, 8).map((row) => ({ key: row.id, label: row.name, value: row[metric] ?? 0 }))
  }, [report.data, metric, meta.lowerIsBetter])

  const retry = () => void report.refetch()
  return (
    <div className="min-w-0 space-y-3">
      <div className="grid min-w-0 gap-3 lg:grid-cols-2">
        {hidden ? (
          <div className="rounded-md border border-border p-4 text-sm lg:col-span-2">
            <Restricted /> <span className="ml-2 text-muted-foreground">Spend, revenue and cost figures need the view-spend permission. Lead counts are shown.</span>
          </div>
        ) : (
          <AreaChartCard
            title="Spend vs revenue"
            subtitle="Daily spend (solid) against revenue won (dashed)"
            points={(spend.data ?? []).map((p) => ({ label: p.date.slice(5), value: p.spend ?? 0, previous: p.revenue ?? 0 }))}
            valueLabel="Spend"
            previousLabel="Revenue"
            isLoading={spend.isLoading}
            isError={spend.isError}
            onRetry={() => void spend.refetch()}
          />
        )}
        <DonutChartCard
          title="Channel mix"
          subtitle="Share of leads by platform"
          slices={(report.data?.channelMix ?? []).map((r) => ({ key: r.key, label: r.label, value: r.count }))}
          isLoading={report.isLoading}
          isError={report.isError}
          onRetry={retry}
        />
      </div>
      {!hidden ? (
        <BarChartCard
          title={`Campaign ranking: ${meta.label}`}
          points={ranking}
          valueLabel={meta.label}
          isLoading={report.isLoading}
          isError={report.isError}
          onRetry={retry}
          onSelect={(id) => navigate(leadFieldHref('campaignId', id))}
          actions={
            <Select
              className="w-44 print:hidden"
              aria-label="Ranking metric"
              value={metric}
              onValueChange={(value) => setMetric(value as Metric)}
              options={METRICS.map((m) => ({ value: m.value, label: m.label }))}
            />
          }
        />
      ) : null}
      <div className="flex justify-end print:hidden">
        <Select
          className="w-40"
          aria-label="Group performance by"
          value={state.campaignView}
          onValueChange={(value) => state.setCampaignView(value as DateRangeState['campaignView'])}
          options={VIEWS.map((v) => ({ value: v.value, label: v.label }))}
        />
      </div>
      <QueryState isLoading={report.isLoading} isError={report.isError} onRetry={retry} isEmpty={rows.length === 0} emptyTitle="No campaign activity in this period">
        <CampaignPerformanceTable
          title={`Performance ${VIEWS.find((v) => v.value === state.campaignView)?.label.toLowerCase() ?? ''}`}
          rows={rows}
          hidden={hidden}
          linkField={state.campaignView === 'campaign' ? 'campaignId' : undefined}
        />
      </QueryState>
      <AttributionTable
        mode={state.attribution}
        onModeChange={state.setAttribution}
        rows={attribution.data}
        isLoading={attribution.isLoading}
        isError={attribution.isError}
        onRetry={() => void attribution.refetch()}
      />
    </div>
  )
}
