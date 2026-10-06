import { useState } from 'react'
import { Plus, ShieldOff } from 'lucide-react'
import { RoleGate } from '@/components/common/RoleGate'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, EmptyState, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@/components/ui'
import { useDateRangeState } from '@/hooks/use-date-range-state'
import { usePermission } from '@/hooks/use-permission'
import { useAuthStore } from '@/store/auth-store'
import { BroadcastsTab } from '../components/broadcasts/BroadcastsTab'
import { CampaignDrawer } from '../components/form/CampaignDrawer'
import { CampaignBulkBar } from '../components/list/CampaignBulkBar'
import { CampaignFiltersBar } from '../components/list/CampaignFiltersBar'
import { CampaignSummaryStrip } from '../components/list/CampaignSummaryStrip'
import { CampaignsTable } from '../components/list/CampaignsTable'
import { useBulkCampaignAction, useCampaignSummary, useCampaigns } from '../hooks/use-campaigns'
import { useCampaignListUrl, type CampaignTab } from '../lib/list-url'

export function CampaignsPage() {
  const url = useCampaignListUrl()
  const range = useDateRangeState()
  const { can, feature } = usePermission()
  const userId = useAuthStore((state) => state.user?.id ?? '')
  const spendHidden = !feature('view-spend')
  const params = url.toListParams(range.range)
  const list = useCampaigns(params)
  const summary = useCampaignSummary({ ...params, page: undefined, pageSize: undefined, sort: undefined })
  const overall = useCampaignSummary({ range: range.range })
  const bulk = useBulkCampaignAction()
  const [selected, setSelected] = useState<string[]>([])
  const [drawer, setDrawer] = useState(false)

  return (
    <RoleGate
      resource="campaigns"
      fallback={
        <EmptyState icon={ShieldOff} title="You don't have access to this page" description="Ask a workspace admin if you need access to campaigns." />
      }
    >
      <PageHeader
        className="mb-4"
        title="Campaigns"
        description="Spend, leads and revenue by campaign."
        actions={
          can('campaigns', 'create') ? (
            <Button onClick={() => setDrawer(true)}>
              <Plus aria-hidden="true" /> New campaign
            </Button>
          ) : null
        }
      />
      <Tabs value={url.tab} onValueChange={(value) => url.setTab(value as CampaignTab)}>
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp broadcasts</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns" className="mt-4 space-y-4">
          <CampaignSummaryStrip
            summary={summary.data}
            isLoading={summary.isLoading}
            isError={summary.isError}
            onRetry={() => void summary.refetch()}
            spendHidden={spendHidden}
          />
          <CampaignFiltersBar url={url} range={range} />
          <CampaignsTable
            url={url}
            data={list.data}
            isLoading={list.isLoading}
            isError={list.isError}
            onRetry={() => void list.refetch()}
            spendHidden={spendHidden}
            tenantAvgCpl={overall.data?.cpl ?? null}
            selectedIds={selected}
            onSelectionChange={setSelected}
            onCreate={() => setDrawer(true)}
            canCreate={can('campaigns', 'create')}
          />
          {can('campaigns', 'edit') ? (
            <CampaignBulkBar
              count={selected.length}
              busy={bulk.isPending}
              onClear={() => setSelected([])}
              onAction={(action) =>
                bulk.mutate(
                  { ids: selected, action },
                  {
                    onSuccess: () => {
                      toast.success(action === 'archive' ? 'Campaigns archived' : `Campaigns ${action}d`)
                      setSelected([])
                    },
                  },
                )
              }
            />
          ) : null}
        </TabsContent>
        <TabsContent value="whatsapp">
          <BroadcastsTab />
        </TabsContent>
      </Tabs>
      <CampaignDrawer open={drawer} campaign={null} ownerId={userId} onOpenChange={setDrawer} />
    </RoleGate>
  )
}
