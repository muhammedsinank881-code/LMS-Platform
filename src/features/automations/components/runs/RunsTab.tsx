import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { History } from 'lucide-react'
import type { DataTableColumn } from '@/components/common/data-table'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { DataTable } from '@/components/common/data-table'
import { DatePicker, EmptyState, Select } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { formatDateTime, formatRelative } from '@/lib/format/date'
import { RUN_STATUSES, type AutomationRun, type EntityKind, type RunStatus } from '@/types'
import { useAutomationRuns } from '../../hooks/use-automation-runs'
import { useAutomations } from '../../hooks/use-automations'
import { RUN_STATUS_LABEL } from '../../lib/run-status'
import { RunStatusBadge } from '../RunStatusBadge'
import { RunDrawer } from './RunDrawer'

const ALL = 'all'
const ENTITIES: Array<{ value: string; label: string }> = [
  { value: ALL, label: 'All records' },
  { value: 'lead', label: 'Leads' },
  { value: 'deal', label: 'Deals' },
  { value: 'followup', label: 'Follow-ups' },
  { value: 'system', label: 'System' },
]

const startOfDay = (value: string) => (value ? new Date(`${value}T00:00:00`).toISOString() : undefined)
const endOfDay = (value: string) => (value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined)

function entityHref(run: AutomationRun): string | null {
  return run.entity.kind === 'lead' ? `/leads/${run.entity.id}` : run.entity.kind === 'deal' ? `/deals/${run.entity.id}` : null
}

export function RunsTab() {
  const { can } = usePermission()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useState(ALL)
  const [automationId, setAutomationId] = useState(ALL)
  const [entity, setEntity] = useState(ALL)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const openId = params.get('run')
  const automations = useAutomations({ pageSize: 100 })
  const runs = useAutomationRuns({
    page,
    pageSize,
    ...(status !== ALL && { statuses: [status as RunStatus] }),
    ...(automationId !== ALL && { automationId }),
    ...(entity !== ALL && { entityKind: entity as EntityKind }),
    from: startOfDay(from),
    to: endOfDay(to),
  })
  const reset = <T,>(set: (value: T) => void) => (value: T) => {
    set(value)
    setPage(1)
  }
  const setOpen = (id: string | null) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id) next.set('run', id)
      else next.delete('run')
      return next
    }, { replace: true })

  const columns: DataTableColumn<AutomationRun>[] = [
    {
      id: 'automation',
      header: 'Automation',
      meta: { className: 'min-w-[12rem]' },
      cell: ({ row }) => (
        <Link className="font-medium hover:underline" to={`/automations/${row.original.automationId}`} onClick={(e) => e.stopPropagation()}>
          {row.original.automationName}
        </Link>
      ),
    },
    {
      id: 'record',
      header: 'Record',
      cell: ({ row }) => {
        const href = entityHref(row.original)
        const label = `${row.original.entity.kind} ${row.original.entity.id}`
        return href ? (
          <Link className="hover:underline" to={href} onClick={(e) => e.stopPropagation()}>
            {label}
          </Link>
        ) : (
          label
        )
      },
    },
    { id: 'status', header: 'Status', cell: ({ row }) => <RunStatusBadge status={row.original.status} /> },
    { id: 'started', header: 'Started', cell: ({ row }) => <span title={formatDateTime(row.original.startedAt)}>{formatRelative(row.original.startedAt)}</span> },
    {
      id: 'when',
      header: 'Finished / resumes',
      cell: ({ row }) =>
        row.original.status === 'waiting' && row.original.resumeAt
          ? `Resumes ${formatDateTime(row.original.resumeAt)}`
          : row.original.finishedAt
            ? formatDateTime(row.original.finishedAt)
            : '—',
    },
  ]

  return (
    <div className="space-y-4">
      <ControlRow>
        <ControlField>
          <Select aria-label="Run status" value={status} onValueChange={reset(setStatus)} options={[{ value: ALL, label: 'All statuses' }, ...RUN_STATUSES.map((s) => ({ value: s, label: RUN_STATUS_LABEL[s] }))]} />
        </ControlField>
        <ControlField className="w-52">
          <Select aria-label="Automation" value={automationId} onValueChange={reset(setAutomationId)} options={[{ value: ALL, label: 'All automations' }, ...(automations.data?.items ?? []).map((a) => ({ value: a.id, label: a.name }))]} />
        </ControlField>
        <ControlField>
          <Select aria-label="Record type" value={entity} onValueChange={reset(setEntity)} options={ENTITIES} />
        </ControlField>
        <ControlField className="w-40">
          <DatePicker aria-label="From date" value={from} onValueChange={reset(setFrom)} />
        </ControlField>
        <ControlField className="w-40">
          <DatePicker aria-label="To date" value={to} onValueChange={reset(setTo)} />
        </ControlField>
      </ControlRow>
      <DataTable
        columns={columns}
        data={runs.data?.items ?? []}
        getRowId={(row) => row.id}
        page={page}
        pageSize={pageSize}
        total={runs.data?.total ?? 0}
        sort={[]}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={() => undefined}
        density="comfortable"
        columnVisibility={{}}
        onColumnVisibilityChange={() => undefined}
        selectedIds={[]}
        selectionMode="page"
        onSelectionChange={() => undefined}
        isLoading={runs.isLoading}
        isError={runs.isError}
        onRetry={() => void runs.refetch()}
        empty={<EmptyState icon={History} title="No runs match" description="Runs appear here as automations fire. Try clearing the filters." />}
        mode="table"
        renderCard={(row) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{row.automationName}</span>
              <RunStatusBadge status={row.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {row.entity.kind} {row.entity.id} · {formatRelative(row.startedAt)}
            </p>
          </div>
        )}
        onRowClick={(row) => setOpen(row.id)}
      />
      <RunDrawer runId={openId} onClose={() => setOpen(null)} canEdit={can('automations', 'edit')} />
    </div>
  )
}
