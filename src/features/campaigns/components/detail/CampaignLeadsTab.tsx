import { useMemo, useState } from 'react'
import { Lock } from 'lucide-react'
import { DataTable } from '@/components/common/data-table'
import { Button, EmptyState } from '@/components/ui'
import { LeadCard } from '@/features/leads/components/LeadCard'
import { createLeadColumns } from '@/features/leads/components/leads-columns'
import { useLeadLookups } from '@/features/leads/hooks/use-lead-lookups'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { useOpenLead } from '@/features/leads/hooks/use-open-lead'
import { listHref } from '@/features/dashboard/lib/links'
import type { DateRange, LeadListParams, SortParam, LeadFilterField } from '@/types'
import { Link } from 'react-router-dom'

const HIDDEN = { select: false, campaignId: false }
const DEFAULT_SORT: SortParam<LeadFilterField>[] = [{ field: 'createdAt', direction: 'desc' }]

/** The leads DataTable with the campaign filter locked, so it can only ever show this campaign. */
export function CampaignLeadsTab({ campaignId, range }: { campaignId: string; range: DateRange }) {
  const { lookups } = useLeadLookups()
  const openLead = useOpenLead()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [sort, setSort] = useState<SortParam<LeadFilterField>[]>(DEFAULT_SORT)
  const params: LeadListParams = {
    page,
    pageSize,
    sort,
    filters: [
      { field: 'campaignId', operator: 'equals', value: campaignId },
      { field: 'createdAt', operator: 'between', value: [range.from, range.to] },
    ],
  }
  const list = useLeads(params)
  const columns = useMemo(
    () =>
      createLeadColumns({
        lookups,
        onEdit: openLead,
        onAssign: openLead,
        onChangeStatus: openLead,
        onDelete: openLead,
        onFollowUp: openLead,
      }),
    [lookups, openLead],
  )
  const actions = { onEdit: openLead, onAssign: openLead, onChangeStatus: openLead, onDelete: openLead, onFollowUp: openLead }

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" aria-hidden="true" />
        Filtered to this campaign and the selected dates.
        <Button asChild size="sm" variant="link">
          <Link to={listHref('/leads', [{ field: 'campaignId', operator: 'equals', value: campaignId }])}>Open in Leads</Link>
        </Button>
      </p>
      <DataTable
        columns={columns}
        data={list.data?.items ?? []}
        getRowId={(row) => row.id}
        page={page}
        pageSize={pageSize}
        total={list.data?.total ?? 0}
        sort={sort}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        onSortChange={(next) => setSort(next as SortParam<LeadFilterField>[])}
        density="comfortable"
        columnVisibility={HIDDEN}
        onColumnVisibilityChange={() => undefined}
        selectedIds={[]}
        selectionMode="page"
        onSelectionChange={() => undefined}
        isLoading={list.isLoading}
        isError={list.isError}
        onRetry={() => void list.refetch()}
        empty={<EmptyState title="No leads from this campaign" description="Nothing came in during these dates." />}
        mode="table"
        renderCard={(lead) => <LeadCard lead={lead} lookups={lookups} {...actions} />}
        onRowClick={(lead) => openLead(lead.id)}
      />
    </div>
  )
}
