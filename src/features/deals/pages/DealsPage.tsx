import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { DataTable } from '@/components/common/data-table'
import { FilterSheet } from '@/components/common/FilterSheet'
import { FilterBuilder, toListFilters, type FilterDraft } from '@/components/common/filter-builder'
import { FilterChips } from '@/components/common/FilterChips'
import { RoleGate } from '@/components/common/RoleGate'
import { SavedViews } from '@/components/common/saved-views/SavedViews'
import { SearchInput } from '@/components/common/SearchInput'
import { CurrencyText } from '@/components/common/CurrencyText'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, EmptyState, Select } from '@/components/ui'
import { downloadCsv, serializeCsv } from '@/lib/csv'
import { useListUrlState } from '@/hooks/use-list-url-state'
import { useLeadLookups } from '@/features/leads/hooks/use-lead-lookups'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { usePipelines } from '@/features/pipeline/hooks/use-pipelines'
import { useSavedViews } from '@/features/saved-views/hooks/use-saved-views'
import { useAuthStore } from '@/store/auth-store'
import type { DealFilterField, DealId, FilterCondition, SavedView } from '@/types'
import { buildDealFilterFields } from '../config/deal-filter-fields'
import { createDealColumns } from '../components/deal-columns'
import { DealCard } from '../components/DealCard'
import { DealDrawer } from '../components/DealDrawer'
import { useDeals, useDealsSummary } from '../hooks/use-deals'
import { useBulkAssignDeals, useBulkDealStage, useBulkDeleteDeals, useExportDeals } from '../hooks/use-deal-actions'

function resolveMe(filters: FilterCondition<DealFilterField>[], userId: string): FilterCondition<DealFilterField>[] {
  return filters.map((filter) =>
    filter.field === 'ownerId' && filter.operator === 'equals' && filter.value === 'me' ? { ...filter, value: userId } : filter,
  )
}

export function DealsPage() {
  const url = useListUrlState<DealFilterField>({ sort: [{ field: 'createdAt', direction: 'desc' }] })
  const userId = useAuthStore((state) => state.user?.id ?? '')
  const { lookups } = useLeadLookups()
  const pipelines = usePipelines()
  const views = useSavedViews('deals')
  const params = { ...url.toListParams(), filters: resolveMe(url.filters, userId) }
  const deals = useDeals(params)
  const leadList = useLeads({ pageSize: 200 })
  const summary = useDealsSummary(params)
  const navigate = useNavigate()
  const [draft, setDraft] = useState<FilterDraft<DealFilterField>[]>(url.filters)
  const [selected, setSelected] = useState<string[]>([])
  const [density] = useState<'comfortable' | 'compact'>('comfortable')
  const [visibility, setVisibility] = useState<Record<string, boolean>>({})
  const [drawer, setDrawer] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [stageId, setStageId] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const bulkDelete = useBulkDeleteDeals()
  const bulkStage = useBulkDealStage()
  const bulkAssign = useBulkAssignDeals()
  const exporter = useExportDeals()
  const fields = useMemo(
    () => buildDealFilterFields(lookups.users, pipelines.data ?? [], lookups.sources, lookups.tags),
    [lookups, pipelines.data],
  )
  const leadNames = useMemo(() => {
    const names = new Map<string, string>()
    for (const lead of leadList.data?.items ?? []) names.set(lead.id, lead.name)
    return names
  }, [leadList.data])
  const columns = useMemo(
    () => createDealColumns(pipelines.data ?? [], lookups.users, (id) => leadNames.get(id) ?? id),
    [leadNames, lookups.users, pipelines.data],
  )
  const stages = (pipelines.data ?? []).flatMap((pipeline) => pipeline.stages)
  const ids = selected as DealId[]

  const applyView = (view: SavedView | null) => {
    if (!view) {
      url.setFilters([])
      return
    }
    url.setFilters(view.conditions as FilterCondition<DealFilterField>[], view.id)
    url.setSort(view.sort as typeof url.sort)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Deals"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/pipeline?board=deals"><LayoutGrid /> Board</Link>
            </Button>
            <RoleGate resource="deals" action="create">
              <Button size="sm" onClick={() => setDrawer(true)}>New deal</Button>
            </RoleGate>
          </div>
        }
      />
      <p className="text-sm text-muted-foreground">
        Pipeline value <CurrencyText amount={summary.data?.total ?? 0} /> · Weighted <CurrencyText amount={summary.data?.weighted ?? 0} />
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <SavedViews
          views={views.data ?? []}
          selectedId={url.viewId}
          isDirty={false}
          defaultViewId={null}
          onSelect={applyView}
          onSaveCurrent={() => undefined}
          onRename={() => undefined}
          onDelete={() => undefined}
          onSetDefault={() => undefined}
        />
        <SearchInput defaultValue={url.search} onValueChange={url.setSearch} aria-label="Search deals" />
        <FilterSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          trigger={<Button variant="outline" size="sm">Filters</Button>}
        >
          <FilterBuilder
            fields={fields}
            value={draft}
            onChange={setDraft}
            onApply={() => {
              url.setFilters(toListFilters(fields, draft))
              setFiltersOpen(false)
            }}
            onClear={() => { setDraft([]); url.setFilters([]) }}
          />
        </FilterSheet>
        <FilterChips fields={fields} filters={url.filters} onRemove={(index) => url.setFilters(url.filters.filter((_, i) => i !== index))} onClear={() => url.setFilters([])} />
      </div>
      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2">
          <span className="text-sm">{selected.length} selected</span>
          <RoleGate resource="deals" action="edit">
            <Select aria-label="Stage" value={stageId} onValueChange={setStageId} options={stages.map((stage) => ({ value: stage.id, label: stage.name }))} placeholder="Change stage" />
            <Button size="sm" disabled={!stageId} onClick={() => bulkStage.mutate({ ids, stageId })}>Apply stage</Button>
          </RoleGate>
          <RoleGate resource="deals" action="assign">
            <Select aria-label="Owner" value={ownerId} onValueChange={setOwnerId} options={lookups.users.map((user) => ({ value: user.id, label: user.name }))} placeholder="Assign" />
            <Button size="sm" disabled={!ownerId} onClick={() => bulkAssign.mutate({ ids, ownerId })}>Assign</Button>
          </RoleGate>
          <RoleGate resource="deals" action="delete">
            <Button size="sm" variant="destructive" onClick={() => bulkDelete.mutate(ids, { onSuccess: () => setSelected([]) })}>Delete</Button>
          </RoleGate>
          <RoleGate resource="deals" action="export">
            <Button size="sm" variant="outline" onClick={() => exporter.mutate(params, { onSuccess: (rows) => downloadCsv('deals.csv', serializeCsv(['Deal', 'Value'], rows.map((row) => [row.title, row.value]))) })}>Export</Button>
          </RoleGate>
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={deals.data?.items ?? []}
        getRowId={(row) => row.id}
        page={url.page}
        pageSize={url.pageSize}
        total={deals.data?.total ?? 0}
        sort={url.sort}
        onPageChange={url.setPage}
        onPageSizeChange={url.setPageSize}
        onSortChange={url.setSort}
        density={density}
        columnVisibility={visibility}
        onColumnVisibilityChange={setVisibility}
        selectedIds={selected}
        selectionMode="page"
        onSelectionChange={(next) => setSelected(next)}
        isLoading={deals.isLoading}
        isError={deals.isError}
        onRetry={() => void deals.refetch()}
        empty={<EmptyState title="No deals match" description="Try another search or clear the filters." />}
        mode="table"
        renderCard={(deal) => {
          const stage = stages.find((item) => item.id === deal.stageId)
          const owner = lookups.users.find((user) => user.id === deal.ownerId)
          return (
            <DealCard
              deal={deal}
              leadName={leadNames.get(deal.leadId) ?? deal.leadId}
              ownerName={owner?.name ?? 'Unassigned'}
              stage={stage ? { name: stage.name, color: stage.color } : undefined}
            />
          )
        }}
        onRowClick={(row) => navigate(`/deals/${row.id}`)}
      />
      <DealDrawer open={drawer} onOpenChange={setDrawer} />
    </div>
  )
}
