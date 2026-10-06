import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Workflow } from 'lucide-react'
import { BulkActionBar } from '@/components/common/BulkActionBar'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { DataTable } from '@/components/common/data-table'
import { SearchInput } from '@/components/common/SearchInput'
import { Badge, Button, EmptyState, Select, toast } from '@/components/ui'
import { useListUrlState } from '@/hooks/use-list-url-state'
import { usePermission } from '@/hooks/use-permission'
import { formatRelative } from '@/lib/format/date'
import { useDirectory } from '@/features/team/hooks/use-team'
import type { Automation, AutomationFilterField, FilterCondition } from '@/types'
import { useAutomationRefs } from '../../hooks/use-automation-refs'
import {
  useAutomations,
  useBulkAutomations,
  useSetAutomationEnabled,
  type BulkAutomationAction,
} from '../../hooks/use-automations'
import { createAutomationColumns, successRate, triggerSentence } from './automation-columns'
import { TemplateGallery } from './TemplateGallery'

const STATUS_FILTERS = [
  { value: 'all', label: 'All automations' },
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
  { value: 'draft', label: 'Drafts' },
]

function filtersFor(status: string): FilterCondition<AutomationFilterField>[] {
  if (status === 'on') return [{ field: 'enabled', operator: 'equals', value: true }]
  if (status === 'off') return [{ field: 'enabled', operator: 'equals', value: false }, { field: 'status', operator: 'equals', value: 'published' }]
  if (status === 'draft') return [{ field: 'status', operator: 'equals', value: 'draft' }]
  return []
}

export function AutomationsTab({ galleryOpen, onGalleryChange }: { galleryOpen: boolean; onGalleryChange: (open: boolean) => void }) {
  const navigate = useNavigate()
  const { can } = usePermission()
  const url = useListUrlState<AutomationFilterField>({ sort: [{ field: 'updatedAt', direction: 'desc' }] })
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<string[]>([])
  const [confirm, setConfirm] = useState<BulkAutomationAction | null>(null)
  const params = { ...url.toListParams(), filters: filtersFor(status), search: url.search }
  const list = useAutomations(params)
  const refs = useAutomationRefs()
  const directory = useDirectory()
  const toggle = useSetAutomationEnabled()
  const bulk = useBulkAutomations()
  const canEdit = can('automations', 'edit')
  const userName = (id: string | null) => directory.data?.find((u) => u.id === id)?.name ?? null

  const columns = useMemo(
    () =>
      createAutomationColumns({
        lookups: refs.lookups,
        userName,
        canEdit,
        onToggle: (a, enabled) => toggle.mutate({ id: a.id, enabled }, { onSuccess: () => toast.success(`${a.name} is ${enabled ? 'on' : 'off'}`) }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refs.lookups, directory.data, canEdit],
  )

  const runBulk = (action: BulkAutomationAction) =>
    bulk.mutate(
      { ids: selected, action },
      {
        onSuccess: ({ ok, failed }) => {
          setConfirm(null)
          setSelected([])
          if (failed > 0) toast.warning(`${ok} updated, ${failed} could not be changed (drafts cannot be turned on).`)
          else toast.success(`${ok} ${ok === 1 ? 'automation' : 'automations'} ${action === 'delete' ? 'deleted' : action === 'enable' ? 'turned on' : 'turned off'}`)
        },
      },
    )

  return (
    <div className="space-y-4">
      <ControlRow>
        <ControlField grow className="w-56 max-w-sm flex-none">
          <SearchInput defaultValue={url.search} onValueChange={url.setSearch} placeholder="Search automations" aria-label="Search automations" />
        </ControlField>
        <ControlField>
          <Select aria-label="Status" value={status} options={STATUS_FILTERS} onValueChange={(value) => { setStatus(value); url.setPage(1) }} />
        </ControlField>
      </ControlRow>
      <DataTable
        columns={columns}
        data={list.data?.items ?? []}
        getRowId={(row) => row.id}
        page={url.page}
        pageSize={url.pageSize}
        total={list.data?.total ?? 0}
        sort={url.sort}
        onPageChange={url.setPage}
        onPageSizeChange={url.setPageSize}
        onSortChange={url.setSort}
        density="comfortable"
        columnVisibility={{}}
        onColumnVisibilityChange={() => undefined}
        selectedIds={selected}
        selectionMode="page"
        onSelectionChange={(ids) => setSelected(ids)}
        isLoading={list.isLoading}
        isError={list.isError}
        onRetry={() => void list.refetch()}
        empty={
          <EmptyState
            icon={Workflow}
            title={url.search || status !== 'all' ? 'No automations match' : 'No automations yet'}
            description={url.search || status !== 'all' ? 'Try another search or clear the filter.' : 'Automate follow-ups, routing and reminders. Start from a template or build your own.'}
            action={
              can('automations', 'create') ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={() => onGalleryChange(true)}>Start from a template</Button>
                  <Button variant="outline" onClick={() => navigate('/automations/new')}>
                    Create automation
                  </Button>
                </div>
              ) : undefined
            }
          />
        }
        mode="table"
        renderCard={(row) => <AutomationCard automation={row} summary={triggerSentence(row, refs.lookups)} />}
        onRowClick={(row) => navigate(`/automations/${row.id}`)}
      />
      <BulkActionBar count={selected.length} onClear={() => setSelected([])} busy={bulk.isPending}>
        <Button size="sm" variant="outline" disabled={!canEdit} onClick={() => runBulk('enable')}>
          Turn on
        </Button>
        <Button size="sm" variant="outline" disabled={!canEdit} onClick={() => runBulk('disable')}>
          Turn off
        </Button>
        <Button size="sm" variant="destructive" disabled={!can('automations', 'delete')} onClick={() => setConfirm('delete')}>
          Delete
        </Button>
      </BulkActionBar>
      <ConfirmDialog
        open={confirm === 'delete'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={`Delete ${selected.length} ${selected.length === 1 ? 'automation' : 'automations'}?`}
        description="Their run history and versions are deleted too. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={bulk.isPending}
        onConfirm={() => runBulk('delete')}
      />
      <TemplateGallery open={galleryOpen} onOpenChange={onGalleryChange} lookups={refs.lookups} canCreate={can('automations', 'create')} />
    </div>
  )
}

function AutomationCard({ automation, summary }: { automation: Automation; summary: string }) {
  const rate = successRate(automation)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Link to={`/automations/${automation.id}`} className="truncate font-medium hover:underline">
          {automation.name}
        </Link>
        <Badge size="sm" tone={automation.enabled ? 'success' : 'neutral'} dot>
          {automation.enabled ? 'On' : automation.status === 'draft' ? 'Draft' : 'Off'}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{summary}</p>
      <p className="text-xs text-muted-foreground">
        {automation.runCount} runs · {rate === null ? 'no success rate yet' : `${Math.round(rate * 100)}% success`} ·{' '}
        {automation.lastRunAt ? `last ${formatRelative(automation.lastRunAt)}` : 'never run'}
      </p>
    </div>
  )
}
