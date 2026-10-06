import type { ReactNode } from 'react'
import { FilterChips } from '@/components/common/FilterChips'
import {
  DataTable,
  type DataTableColumn,
  type SelectionMode,
  type TableDensity,
  type VisibilityState,
} from '@/components/common/data-table'
import type { FilterDraft, FilterFieldConfig } from '@/components/common/filter-builder'
import { Button, EmptyState } from '@/components/ui'
import type { UseListUrlState } from '@/hooks/use-list-url-state'
import type { Lead, LeadFilterField, SavedView } from '@/types'
import { usePrefetchLead } from '../hooks/use-leads'
import { useOpenLead } from '../hooks/use-open-lead'
import { LeadCard } from './LeadCard'
import { LeadsToolbar } from './LeadsToolbar'
import type { LeadLookups } from '../types'
import type { LeadRowActionsProps } from './LeadRowActions'

export interface LeadsListProps {
  url: UseListUrlState<LeadFilterField>
  searchResetKey: string
  fields: FilterFieldConfig<LeadFilterField>[]
  draftFilters: FilterDraft<LeadFilterField>[]
  onDraftFiltersChange: (next: FilterDraft<LeadFilterField>[]) => void
  onApplyFilters: () => void
  onClearFilters: () => void
  views: SavedView[]
  isViewDirty: boolean
  defaultViewId: string | null
  onSelectView: (view: SavedView | null) => void
  onSaveView: (name: string) => void
  onRenameView: (id: string, name: string) => void
  onDeleteView: (id: string) => void
  onSetDefaultView: (id: string | null) => void
  density: TableDensity
  onDensityChange: (density: TableDensity) => void
  columnVisibility: VisibilityState
  onColumnVisibilityChange: (visibility: VisibilityState) => void
  columns: DataTableColumn<Lead>[]
  items: Lead[]
  total: number
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  empty: ReactNode
  lookups: LeadLookups
  actions: Omit<LeadRowActionsProps, 'lead'>
  selectedIds: string[]
  selectionMode: SelectionMode
  onSelectionChange: (ids: string[], mode: SelectionMode) => void
}

export function LeadsList(props: LeadsListProps) {
  const openLead = useOpenLead()
  const prefetchLead = usePrefetchLead()
  return (
    <div className="space-y-4">
      <LeadsToolbar
        search={props.url.search}
        searchResetKey={props.searchResetKey}
        onSearchChange={props.url.setSearch}
        fields={props.fields}
        draftFilters={props.draftFilters}
        onDraftFiltersChange={props.onDraftFiltersChange}
        onApplyFilters={props.onApplyFilters}
        onClearFilters={props.onClearFilters}
        activeFilterCount={props.url.filters.length}
        views={props.views}
        selectedViewId={props.url.viewId}
        isViewDirty={props.isViewDirty}
        defaultViewId={props.defaultViewId}
        onSelectView={props.onSelectView}
        onSaveView={props.onSaveView}
        onRenameView={props.onRenameView}
        onDeleteView={props.onDeleteView}
        onSetDefaultView={props.onSetDefaultView}
        density={props.density}
        onDensityChange={props.onDensityChange}
        columnVisibility={props.columnVisibility}
        onColumnVisibilityChange={props.onColumnVisibilityChange}
        mode={props.url.mode}
        onModeChange={props.url.setMode}
      />
      <FilterChips
        fields={props.fields}
        filters={props.url.filters}
        onRemove={(index) => {
          const next = props.url.filters.filter((_, i) => i !== index)
          props.onDraftFiltersChange(next)
          props.url.setFilters(next)
        }}
        onClear={props.onClearFilters}
      />
      <DataTable
        columns={props.columns}
        data={props.items}
        getRowId={(row) => row.id}
        page={props.url.page}
        pageSize={props.url.pageSize}
        total={props.total}
        sort={props.url.sort}
        onPageChange={props.url.setPage}
        onPageSizeChange={props.url.setPageSize}
        onSortChange={props.url.setSort}
        density={props.density}
        columnVisibility={props.columnVisibility}
        onColumnVisibilityChange={props.onColumnVisibilityChange}
        selectedIds={props.selectedIds}
        selectionMode={props.selectionMode}
        onSelectionChange={props.onSelectionChange}
        isLoading={props.isLoading}
        isError={props.isError}
        onRetry={props.onRetry}
        empty={props.empty}
        mode={props.url.mode}
        renderCard={(lead) => <LeadCard lead={lead} lookups={props.lookups} {...props.actions} />}
        onRowClick={(lead) => openLead(lead.id)}
        onRowIntent={(lead) => prefetchLead(lead.id)}
      />
    </div>
  )
}

export function LeadsFilteredEmpty({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      title="No results match your filters"
      description="Try a different search or clear the current filters."
      action={
        <Button variant="outline" onClick={onClear}>
          Clear filters
        </Button>
      }
    />
  )
}
