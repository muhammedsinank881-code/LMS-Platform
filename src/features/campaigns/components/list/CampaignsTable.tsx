import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Megaphone } from 'lucide-react'
import { DataTable } from '@/components/common/data-table'
import { Button, EmptyState } from '@/components/ui'
import type { CampaignWithMetrics, Paginated } from '@/types'
import type { CampaignListUrl } from '../../lib/list-url'
import { PAGE_SIZE } from '../../lib/list-url'
import { CampaignCard } from './CampaignCard'
import { createCampaignColumns } from './campaign-columns'

export function CampaignsTable({
  url,
  data,
  isLoading,
  isError,
  onRetry,
  spendHidden,
  tenantAvgCpl,
  selectedIds,
  onSelectionChange,
  onCreate,
  canCreate,
}: {
  url: CampaignListUrl
  data: Paginated<CampaignWithMetrics> | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  spendHidden: boolean
  tenantAvgCpl: number | null
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onCreate: () => void
  canCreate: boolean
}) {
  const navigate = useNavigate()
  const [visibility, setVisibility] = useState<Record<string, boolean>>({})
  const columns = useMemo(
    () => createCampaignColumns({ spendHidden, tenantAvgCpl }),
    [spendHidden, tenantAvgCpl],
  )
  const empty = url.hasFilters ? (
    <EmptyState
      icon={Megaphone}
      title="No campaigns match"
      description="Try a different filter or date range."
      action={<Button variant="outline" onClick={url.clear}>Clear filters</Button>}
    />
  ) : (
    <EmptyState
      icon={Megaphone}
      title="No campaigns yet"
      description="Create a campaign to track spend, leads and revenue."
      action={canCreate ? <Button onClick={onCreate}>New campaign</Button> : null}
    />
  )

  return (
    <DataTable
      columns={columns}
      data={data?.items ?? []}
      getRowId={(row) => row.id}
      page={url.page}
      pageSize={data?.pageSize ?? PAGE_SIZE}
      total={data?.total ?? 0}
      sort={url.sort}
      onPageChange={url.setPage}
      onPageSizeChange={() => url.setPage(1)}
      onSortChange={url.setSort}
      density="comfortable"
      columnVisibility={visibility}
      onColumnVisibilityChange={setVisibility}
      selectedIds={selectedIds}
      selectionMode="page"
      onSelectionChange={(ids) => onSelectionChange(ids)}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      empty={empty}
      mode="table"
      renderCard={(row) => <CampaignCard campaign={row} spendHidden={spendHidden} tenantAvgCpl={tenantAvgCpl} />}
      onRowClick={(row) => navigate(`/campaigns/${row.id}`)}
    />
  )
}
