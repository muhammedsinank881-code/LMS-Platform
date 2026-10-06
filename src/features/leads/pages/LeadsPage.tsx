import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, ShieldOff, Upload } from 'lucide-react'
import { RoleGate } from '@/components/common/RoleGate'
import type { SelectionMode, TableDensity, VisibilityState } from '@/components/common/data-table'
import { toListFilters, type FilterDraft } from '@/components/common/filter-builder'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, EmptyState, toast } from '@/components/ui'
import { useDefaultView } from '@/hooks/use-default-view'
import { useListUrlState } from '@/hooks/use-list-url-state'
import { usePermission } from '@/hooks/use-permission'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { useWorkspace } from '@/hooks/use-workspace'
import { useAuthStore } from '@/store/auth-store'
import { useUiStore } from '@/store/ui-store'
import { useSavedViews, useCreateSavedView, useDeleteSavedView, useUpdateSavedView } from '@/features/saved-views/hooks/use-saved-views'
import type { LeadFilterField, LeadId, SavedView } from '@/types'
import { buildLeadFilterFields, customLeadFilterFields } from '../config/lead-filter-fields'
import type { FilterFieldConfig } from '@/components/common/filter-builder'
import { LeadsFilteredEmpty, LeadsList } from '../components/LeadsList'
import { LeadsBulkBar } from '../components/bulk/LeadsBulkBar'
import { LeadsPageDialogs } from '../components/LeadsPageDialogs'
import { createLeadColumns } from '../components/leads-columns'
import { useLeadLookups } from '../hooks/use-lead-lookups'
import { useLeads, usePrefetchNextLeadPage } from '../hooks/use-leads'
import { useExportLeads } from '../hooks/use-lead-mutations'
import { exportLeadsCsv } from '../lib/export-leads-csv'
import { filtersMatch } from '../lib/view-helpers'

const DEFAULT_SORT = [{ field: 'createdAt' as const, direction: 'desc' as const }]
const EMPTY_VIEWS: SavedView[] = []

export function LeadsPage() {
  const { can } = usePermission()
  const { tenantId } = useWorkspace()
  const userId = useAuthStore((state) => state.user?.id ?? 'anon')
  const url = useListUrlState<LeadFilterField>({ sort: DEFAULT_SORT })
  const [searchParams, setSearchParams] = useSearchParams()
  const openFollowUp = useUiStore((state) => state.openFollowUp)
  const composeLead = searchParams.get('compose') === 'lead'
  const { lookups, customFields, lostReasons } = useLeadLookups()
  const fields = useMemo(
    () =>
      [...buildLeadFilterFields(lookups), ...customLeadFilterFields(customFields ?? [])] as FilterFieldConfig<
        LeadFilterField
      >[],
    [lookups, customFields],
  )
  const listParams = url.toListParams()
  const list = useLeads(listParams)
  usePrefetchNextLeadPage(listParams, list.data?.total)
  const views = useSavedViews('leads').data ?? EMPTY_VIEWS
  const createView = useCreateSavedView()
  const updateView = useUpdateSavedView()
  const deleteView = useDeleteSavedView()
  const exportLeads = useExportLeads()
  const { defaultViewId, setDefaultViewId } = useDefaultView('leads')
  const [density, setDensity] = usePersistentState<TableDensity>(
    `leadflow:leads:density:${tenantId}:${userId}`,
    'comfortable',
  )
  const [columnVisibility, setColumnVisibility] = usePersistentState<VisibilityState>(
    `leadflow:leads:cols:v3:${tenantId}:${userId}`,
    { campaignId: false, tags: false, lastContactedAt: false, createdAt: false },
  )
  const [draftFilters, setDraftFilters] = useState<FilterDraft<LeadFilterField>[]>(url.filters)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('page')
  const [drawer, setDrawer] = useState<{ mode: 'create' } | { mode: 'edit'; id: LeadId } | null>(null)
  const [assignIds, setAssignIds] = useState<LeadId[] | null>(null)
  const [statusIds, setStatusIds] = useState<LeadId[] | null>(null)
  const [tagState, setTagState] = useState<{ ids: LeadId[]; mode: 'add' | 'remove' } | null>(null)
  const [deleteIds, setDeleteIds] = useState<LeadId[] | null>(null)
  const [searchEpoch, setSearchEpoch] = useState(0)
  const appliedDefault = useRef(false)

  useEffect(() => {
    if (appliedDefault.current || url.viewId || url.filters.length || url.search) return
    const view = views.find((item) => item.id === defaultViewId)
    if (!view) return
    appliedDefault.current = true
    const filters = view.conditions as typeof url.filters
    const sort = view.sort as typeof url.sort
    queueMicrotask(() => {
      url.replace({ filters, sort, viewId: view.id, page: 1 })
      setDraftFilters(view.conditions as FilterDraft<LeadFilterField>[])
    })
  }, [defaultViewId, url, views])

  const selectedView = views.find((view) => view.id === url.viewId) ?? null
  const isViewDirty = Boolean(
    selectedView && !filtersMatch(selectedView.conditions, url.filters, selectedView.sort, url.sort),
  )

  const selectView = (view: SavedView | null) => {
    if (!view) {
      url.replace({ filters: [], viewId: null, page: 1 })
      setDraftFilters([])
      return
    }
    url.replace({
      filters: view.conditions as LeadFilterField extends string ? typeof url.filters : typeof url.filters,
      sort: view.sort as typeof url.sort,
      viewId: view.id,
      page: 1,
    })
    setDraftFilters(view.conditions as FilterDraft<LeadFilterField>[])
  }

  const clearFilters = () => {
    setDraftFilters([])
    setSearchEpoch((value) => value + 1)
    url.replace({ filters: [], viewId: null, page: 1, search: '' })
  }

  const resolveIds = async (): Promise<LeadId[]> => {
    if (selectionMode !== 'all') return selectedIds as LeadId[]
    const rows = await exportLeads.mutateAsync(url.toListParams())
    return rows.map((row) => row.id)
  }

  const onEdit = useCallback((id: LeadId) => setDrawer({ mode: 'edit', id }), [])
  const onAssign = useCallback((id: LeadId) => setAssignIds([id]), [])
  const onChangeStatus = useCallback((id: LeadId) => setStatusIds([id]), [])
  const onDelete = useCallback((id: LeadId) => setDeleteIds([id]), [])
  const onFollowUp = useCallback(
    (id: LeadId) => openFollowUp({ leadIds: [id], lockLead: true }),
    [openFollowUp],
  )
  const actions = useMemo(
    () => ({ onEdit, onAssign, onChangeStatus, onDelete, onFollowUp }),
    [onAssign, onChangeStatus, onDelete, onEdit, onFollowUp],
  )
  const columns = useMemo(() => createLeadColumns({ lookups, ...actions }), [actions, lookups])

  const hasQuery = Boolean(url.search || url.filters.length)
  const empty = hasQuery ? (
    <LeadsFilteredEmpty onClear={clearFilters} />
  ) : (
    <EmptyState
      title="No leads yet"
      description="Add your first lead to start the pipeline."
      action={
        can('leads', 'create') ? (
          <Button onClick={() => setDrawer({ mode: 'create' })}>
            <Plus /> Add your first lead
          </Button>
        ) : null
      }
    />
  )

  return (
    <RoleGate
      resource="leads"
      fallback={
        <EmptyState
          icon={ShieldOff}
          title="You don't have access to this page"
          description="Ask a workspace admin if you need access to leads."
        />
      }
    >
      <PageHeader
        className="mb-4"
        title="Leads"
        description="Every inbound conversation, owned and scored."
        actions={
          <>
            <RoleGate resource="leads" action="import">
              <Button variant="outline" disabled title="Import is not available in this version">
                <Upload /> Import
              </Button>
            </RoleGate>
            <RoleGate resource="leads" action="export">
              <Button
                variant="outline"
                loading={exportLeads.isPending}
                onClick={async () => {
                  const rows = await exportLeads.mutateAsync(url.toListParams())
                  exportLeadsCsv(rows, lookups, 'leads.csv')
                  toast.success(`Exported ${rows.length} leads`)
                }}
              >
                Export
              </Button>
            </RoleGate>
            <RoleGate resource="leads" action="create">
              <Button onClick={() => setDrawer({ mode: 'create' })}>
                <Plus /> Add Lead
              </Button>
            </RoleGate>
          </>
        }
      />
      <LeadsList
        url={url}
        searchResetKey={String(searchEpoch)}
        fields={fields}
        draftFilters={draftFilters}
        onDraftFiltersChange={setDraftFilters}
        onApplyFilters={() => url.setFilters(toListFilters(fields, draftFilters), url.viewId)}
        onClearFilters={clearFilters}
        views={views}
        isViewDirty={isViewDirty}
        defaultViewId={defaultViewId}
        onSelectView={selectView}
        onSaveView={(name) =>
          createView.mutate({
            entity: 'leads',
            name,
            icon: '📌',
            conditions: url.filters,
            sort: url.sort,
          })
        }
        onRenameView={(id, name) => updateView.mutate({ id, patch: { name } })}
        onDeleteView={(id) => {
          deleteView.mutate(id)
          if (url.viewId === id) url.setViewId(null)
        }}
        onSetDefaultView={setDefaultViewId}
        density={density}
        onDensityChange={setDensity}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columns={columns}
        items={list.data?.items ?? []}
        total={list.data?.total ?? 0}
        isLoading={list.isLoading || (list.isFetching && (list.data?.items.length ?? 0) === 0)}
        isError={list.isError}
        onRetry={() => void list.refetch()}
        empty={empty}
        lookups={lookups}
        actions={actions}
        selectedIds={selectedIds}
        selectionMode={selectionMode}
        onSelectionChange={(ids, mode) => {
          setSelectedIds(ids)
          setSelectionMode(mode)
        }}
      />
      <LeadsBulkBar
        count={selectionMode === 'all' ? (list.data?.total ?? selectedIds.length) : selectedIds.length}
        total={list.data?.total ?? 0}
        selectionMode={selectionMode}
        busy={exportLeads.isPending}
        onClear={() => {
          setSelectedIds([])
          setSelectionMode('page')
        }}
        onAssign={() => void resolveIds().then(setAssignIds)}
        onChangeStatus={() => void resolveIds().then(setStatusIds)}
        onAddTags={() => void resolveIds().then((ids) => setTagState({ ids, mode: 'add' }))}
        onRemoveTags={() => void resolveIds().then((ids) => setTagState({ ids, mode: 'remove' }))}
        onExport={async () => {
          const rows = await exportLeads.mutateAsync(url.toListParams())
          const picked =
            selectionMode === 'all' ? rows : rows.filter((row) => selectedIds.includes(row.id))
          exportLeadsCsv(picked, lookups, 'leads-selected.csv')
          toast.success(`Exported ${picked.length} leads`)
          setSelectedIds([])
          setSelectionMode('page')
        }}
        onDelete={() => void resolveIds().then(setDeleteIds)}
        onFollowUp={() =>
          void resolveIds().then((ids) => openFollowUp({ leadIds: ids, lockLead: true }))
        }
      />
      <LeadsPageDialogs
        lookups={lookups}
        customFields={(customFields ?? []).filter((field) => field.entity === 'lead' && field.archived !== true)}
        lostReasons={lostReasons ?? []}
        drawer={composeLead ? { mode: 'create' } : drawer}
        onDrawerOpenChange={(open) => {
          if (open) return
          setDrawer(null)
          if (!composeLead) return
          const next = new URLSearchParams(searchParams)
          next.delete('compose')
          setSearchParams(next, { replace: true })
        }}
        assignIds={assignIds}
        statusIds={statusIds}
        tagState={tagState}
        deleteIds={deleteIds}
        onCloseAssign={() => setAssignIds(null)}
        onCloseStatus={() => setStatusIds(null)}
        onCloseTags={() => setTagState(null)}
        onCloseDelete={() => setDeleteIds(null)}
        onClearedSelection={() => {
          setSelectedIds([])
          setSelectionMode('page')
        }}
      />
    </RoleGate>
  )
}
