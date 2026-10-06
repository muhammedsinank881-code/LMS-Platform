import { useState } from 'react'
import { Filter, LayoutGrid, Table2 } from 'lucide-react'
import { FilterSheet } from '@/components/common/FilterSheet'
import { FilterBuilder, type FilterDraft, type FilterFieldConfig } from '@/components/common/filter-builder'
import { SavedViews } from '@/components/common/saved-views/SavedViews'
import { SearchInput } from '@/components/common/SearchInput'
import { ColumnPicker, DensityToggle, type TableDensity, type VisibilityState } from '@/components/common/data-table'
import { Button } from '@/components/ui'
import type { LeadFilterField, SavedView } from '@/types'
import { LEAD_COLUMN_LABELS } from '../config/lead-column-labels'

export interface LeadsToolbarProps {
  search: string
  searchResetKey: string
  onSearchChange: (value: string) => void
  fields: FilterFieldConfig<LeadFilterField>[]
  draftFilters: FilterDraft<LeadFilterField>[]
  onDraftFiltersChange: (next: FilterDraft<LeadFilterField>[]) => void
  onApplyFilters: () => void
  onClearFilters: () => void
  activeFilterCount: number
  views: SavedView[]
  selectedViewId: string | null
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
  mode: 'table' | 'card'
  onModeChange: (mode: 'table' | 'card') => void
}

export function LeadsToolbar(props: LeadsToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          key={props.searchResetKey}
          className="w-full sm:max-w-md"
          defaultValue={props.search}
          onValueChange={props.onSearchChange}
          placeholder="Search name, phone, email, company…"
        />
        <div className="flex shrink-0 items-center gap-2 overflow-x-auto">
          <FilterSheet
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            trigger={
              <Button variant="outline" size="sm">
                <Filter />
                Filters
                {props.activeFilterCount > 0 ? (
                  <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                    {props.activeFilterCount}
                  </span>
                ) : null}
              </Button>
            }
          >
            <FilterBuilder
              fields={props.fields}
              value={props.draftFilters}
              onChange={props.onDraftFiltersChange}
              onApply={() => {
                props.onApplyFilters()
                setFiltersOpen(false)
              }}
              onClear={props.onClearFilters}
            />
          </FilterSheet>
          <ColumnPicker
            columns={LEAD_COLUMN_LABELS}
            visibility={props.columnVisibility}
            onVisibilityChange={props.onColumnVisibilityChange}
          />
          <DensityToggle density={props.density} onDensityChange={props.onDensityChange} />
          <Button
            variant="outline"
            size="sm"
            aria-pressed={props.mode === 'card'}
            onClick={() => props.onModeChange(props.mode === 'table' ? 'card' : 'table')}
          >
            {props.mode === 'card' ? <Table2 /> : <LayoutGrid />}
            <span className="hidden sm:inline">{props.mode === 'card' ? 'Table' : 'Cards'}</span>
          </Button>
        </div>
      </div>
      <SavedViews
        views={props.views}
        selectedId={props.selectedViewId}
        isDirty={props.isViewDirty}
        defaultViewId={props.defaultViewId}
        onSelect={props.onSelectView}
        onSaveCurrent={props.onSaveView}
        onRename={props.onRenameView}
        onDelete={props.onDeleteView}
        onSetDefault={props.onSetDefaultView}
      />
    </div>
  )
}
