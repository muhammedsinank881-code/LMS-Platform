import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { QueryState } from '@/components/common/QueryState'
import { DateRangePicker, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@/components/ui'
import { useDateRangeState } from '@/hooks/use-date-range-state'
import { usePermission } from '@/hooks/use-permission'
import { useAuthStore } from '@/store/auth-store'
import { AdSetBreakdownTable } from '../components/detail/AdSetBreakdownTable'
import { BudgetProgress } from '../components/detail/BudgetProgress'
import { CampaignAuditTab } from '../components/detail/CampaignAuditTab'
import { CampaignFunnelCard } from '../components/detail/CampaignFunnelCard'
import { CampaignInfoStrip } from '../components/detail/CampaignInfoStrip'
import { CampaignInsights } from '../components/detail/CampaignInsights'
import { CampaignHeader } from '../components/detail/CampaignHeader'
import { CampaignLeadsTab } from '../components/detail/CampaignLeadsTab'
import { CampaignStatCards } from '../components/detail/CampaignStatCards'
import { SpendLeadsChart } from '../components/detail/SpendLeadsChart'
import { SpendTab } from '../components/detail/SpendTab'
import { CampaignDrawer } from '../components/form/CampaignDrawer'
import { PerformanceFlag } from '../components/PerformanceFlag'
import {
  useBulkCampaignAction,
  useCampaign,
  useCampaignBreakdown,
  useCampaignDetail,
  useCampaignFunnel,
  useCampaignTimeSeries,
  useUpdateCampaign,
} from '../hooks/use-campaigns'

const TABS = ['overview', 'leads', 'spend', 'activity'] as const
type DetailTab = (typeof TABS)[number]

export function CampaignDetailPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const range = useDateRangeState()
  const { can, feature } = usePermission()
  const userId = useAuthStore((state) => state.user?.id ?? '')
  const spendHidden = !feature('view-spend')
  const query = { range: range.range, compare: range.compare }
  const whole = useCampaign(id)
  const detail = useCampaignDetail(id, query)
  const funnel = useCampaignFunnel(id, query)
  const series = useCampaignTimeSeries(id, query)
  const breakdown = useCampaignBreakdown(id, query)
  const update = useUpdateCampaign()
  const bulk = useBulkCampaignAction()
  const [editing, setEditing] = useState(false)
  const tabParam = params.get('dtab')
  const tab: DetailTab = (TABS as readonly string[]).includes(tabParam ?? '') ? (tabParam as DetailTab) : 'overview'
  const setTab = (next: string) => {
    const copy = new URLSearchParams(params)
    if (next === 'overview') copy.delete('dtab')
    else copy.set('dtab', next)
    setParams(copy, { replace: true })
  }
  const campaign = whole.data

  return (
    <QueryState
      isLoading={whole.isLoading}
      loading={<div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-16 w-full" /><Skeleton className="h-64 w-full" /></div>}
      isError={whole.isError && !campaign}
      onRetry={() => void whole.refetch()}
      isEmpty={!whole.isLoading && !whole.isError && !campaign}
      emptyIcon={SearchX}
      emptyTitle="Campaign not found"
      emptyDescription="It may have been deleted."
    >
      {campaign ? (
        <div className="min-w-0 space-y-4">
          <CampaignHeader
            campaign={campaign}
            canEdit={can('campaigns', 'edit')}
            busy={update.isPending || bulk.isPending}
            onEdit={() => setEditing(true)}
            onToggle={() =>
              update.mutate(
                { id: campaign.id, patch: { status: campaign.status === 'active' ? 'paused' : 'active' } },
                { onSuccess: () => toast.success('Campaign updated') },
              )
            }
            onArchive={() =>
              bulk.mutate({ ids: [campaign.id], action: 'archive' }, { onSuccess: () => toast.success('Campaign archived') })
            }
          />
          <CampaignInfoStrip campaign={campaign} />
          <div className="flex flex-wrap items-center gap-3">
            <DateRangePicker
              preset={range.preset}
              fromDay={range.fromDay}
              toDay={range.toDay}
              compare={range.compare}
              onPreset={range.setPreset}
              onCustom={range.setCustom}
              onCompare={range.setCompare}
            />
            <PerformanceFlag metrics={detail.data?.campaign.metrics ?? campaign.metrics} tenantAvgCpl={detail.data?.tenantAvgCpl ?? null} />
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leads">Leads{detail.data ? ` (${detail.data.campaign.metrics.leads})` : ''}</TabsTrigger>
              <TabsTrigger value="spend">Spend</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4 space-y-3">
              <CampaignInsights campaign={campaign} metrics={detail.data?.campaign.metrics} spent={campaign.metrics.spend} tenantAvgCpl={detail.data?.tenantAvgCpl ?? null} />
              <CampaignStatCards
                current={detail.data?.campaign.metrics}
                previous={detail.data?.previous}
                preset={range.preset}
                isLoading={detail.isLoading}
                isError={detail.isError}
                onRetry={() => void detail.refetch()}
                spendHidden={spendHidden}
              />
              <div className="grid min-w-0 gap-3 lg:grid-cols-3">
                <div className="min-w-0 lg:col-span-2">
                  <SpendLeadsChart points={series.data} isLoading={series.isLoading} isError={series.isError} onRetry={() => void series.refetch()} />
                </div>
                <div className="min-w-0 space-y-3">
                  <BudgetProgress campaign={campaign} spent={campaign.metrics.spend} hidden={spendHidden} />
                  <CampaignFunnelCard steps={funnel.data} isLoading={funnel.isLoading} isError={funnel.isError} onRetry={() => void funnel.refetch()} spendHidden={spendHidden} />
                </div>
              </div>
              <AdSetBreakdownTable rows={breakdown.data} isLoading={breakdown.isLoading} isError={breakdown.isError} onRetry={() => void breakdown.refetch()} spendHidden={spendHidden} />
            </TabsContent>
            <TabsContent value="leads"><CampaignLeadsTab campaignId={campaign.id} range={range.range} /></TabsContent>
            <TabsContent value="spend"><SpendTab campaignId={campaign.id} /></TabsContent>
            <TabsContent value="activity"><CampaignAuditTab campaignId={campaign.id} /></TabsContent>
          </Tabs>
          <CampaignDrawer open={editing} campaign={campaign} ownerId={userId} onOpenChange={setEditing} />
        </div>
      ) : null}
    </QueryState>
  )
}
