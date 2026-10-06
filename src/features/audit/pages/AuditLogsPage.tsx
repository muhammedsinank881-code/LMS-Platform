import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DataTableColumn } from '@/components/common/data-table/types'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { DataTable } from '@/components/common/data-table'
import { NoAccess } from '@/components/common/NoAccess'
import { SearchInput } from '@/components/common/SearchInput'
import { UserAvatarCell } from '@/components/common/UserAvatarCell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle, EmptyState, Select, Skeleton } from '@/components/ui'
import { AlertTriangle, Inbox } from 'lucide-react'
import { downloadCsv } from '@/lib/csv'
import { formatDateTime } from '@/lib/format/date'
import { summarizeAuditChange } from '@/lib/settings/audit-summary'
import { useListUrlState } from '@/hooks/use-list-url-state'
import { usePermission } from '@/hooks/use-permission'
import { AUDIT_ACTIONS, AUDIT_ENTITIES, type AuditLog } from '@/types'
import { useDirectory } from '@/features/team/hooks/use-team'
import { useAuditLog, useAuditLogs, useExportAuditLogs } from '../hooks/use-audit-logs'

const QUICK = [
  { label: 'Leads', entity: 'lead' },
  { label: 'Deals', entity: 'deal' },
  { label: 'Settings', entity: 'setting' },
  { label: 'Team', entity: 'user' },
  { label: 'Imports/Exports', entity: '' },
  { label: 'Auth', entity: '' },
] as const

function titleCase(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function AuditLogsPage() {
  const { can } = usePermission()
  const url = useListUrlState({ sort: [{ field: 'createdAt', direction: 'desc' as const }] })
  const [entity, setEntity] = useState('')
  const [action, setAction] = useState('')
  const [userId, setUserId] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const users = useDirectory()
  const filters = [
    ...(entity ? [{ field: 'entity' as const, operator: 'equals' as const, value: entity }] : []),
    ...(action ? [{ field: 'action' as const, operator: 'equals' as const, value: action }] : []),
    ...(userId ? [{ field: 'userId' as const, operator: 'equals' as const, value: userId }] : []),
  ]
  const params = { ...url.toListParams(), filters, search: url.search }
  const logs = useAuditLogs(can('audit_logs', 'view') ? params : undefined)
  const detail = useAuditLog(openId)
  const exporter = useExportAuditLogs()
  if (!can('audit_logs', 'view')) return <NoAccess title="You don't have access to audit logs" />
  const columns: DataTableColumn<AuditLog>[] = [
    { id: 'when', header: 'When', cell: ({ row }) => formatDateTime(row.original.createdAt) },
    { id: 'user', header: 'User', cell: ({ row }) => row.original.actorType === 'system' ? <span className="inline-flex items-center gap-2"><Badge size="sm" tone="primary">Automation</Badge><Link to={`/automations/${row.original.automationId}`}>{row.original.actorLabel?.replace('Automation: ', '')}</Link></span> : <UserAvatarCell name={users.data?.find((user) => user.id === row.original.userId)?.name ?? row.original.userId} /> },
    { id: 'action', header: 'Action', cell: ({ row }) => <Badge>{titleCase(row.original.action)}</Badge> },
    { id: 'entity', header: 'Record', cell: ({ row }) => <EntityLink log={row.original} /> },
    { id: 'summary', header: 'Change', cell: ({ row }) => summarizeAuditChange(row.original) },
    { id: 'ip', header: 'IP / device', cell: ({ row }) => `${row.original.ip} · ${row.original.device}` },
  ]
  return (
    <div>
      <PageHeader
        title="Audit logs"
        description="A read-only history of changes in this workspace."
        actions={
          can('audit_logs', 'export') ? (
            <Button
              variant="outline"
              loading={exporter.isPending}
              onClick={() => exporter.mutate(params, { onSuccess: (file) => downloadCsv(file.filename, file.csv) })}
            >
              Export
            </Button>
          ) : null
        }
      />
      <ControlRow className="mb-4">
        <ControlField grow className="w-56 max-w-sm flex-none">
          <SearchInput defaultValue={url.search} onValueChange={url.setSearch} placeholder="Search changes" aria-label="Search audit logs" />
        </ControlField>
        <ControlField>
          <Select aria-label="Action" value={action || 'all'} options={[{ value: 'all', label: 'All actions' }, ...AUDIT_ACTIONS.map((item) => ({ value: item, label: titleCase(item) }))]} onValueChange={(value) => setAction(value === 'all' ? '' : value)} />
        </ControlField>
        <ControlField>
          <Select aria-label="Record" value={entity || 'all'} options={[{ value: 'all', label: 'All records' }, ...AUDIT_ENTITIES.map((item) => ({ value: item, label: titleCase(item) }))]} onValueChange={(value) => setEntity(value === 'all' ? '' : value)} />
        </ControlField>
        <ControlField className="w-48">
          <Select aria-label="User" value={userId || 'all'} options={[{ value: 'all', label: 'All users' }, ...(users.data ?? []).map((user) => ({ value: user.id, label: user.name }))]} onValueChange={(value) => setUserId(value === 'all' ? '' : value)} />
        </ControlField>
        <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden="true" />
        {QUICK.map((item) => (
          <Button key={item.label} size="sm" className="shrink-0" variant={entity === item.entity && item.entity ? 'primary' : 'outline'} onClick={() => setEntity(item.entity)}>
            {item.label}
          </Button>
        ))}
      </ControlRow>
      <DataTable
        columns={columns}
        data={logs.data?.items ?? []}
        getRowId={(row) => row.id}
        page={url.page}
        pageSize={url.pageSize}
        total={logs.data?.total ?? 0}
        sort={url.sort}
        onPageChange={url.setPage}
        onPageSizeChange={url.setPageSize}
        onSortChange={url.setSort}
        density="comfortable"
        columnVisibility={{}}
        onColumnVisibilityChange={() => undefined}
        selectedIds={[]}
        selectionMode="page"
        onSelectionChange={() => undefined}
        isLoading={logs.isLoading}
        isError={logs.isError}
        onRetry={() => logs.refetch()}
        empty={<EmptyState icon={Inbox} title="No audit entries match" description="Try another search or clear the filters." />}
        mode="table"
        renderCard={(row) => <p>{summarizeAuditChange(row)}</p>}
        onRowClick={(row) => setOpenId(row.id)}
      />
      <Drawer open={openId !== null} onOpenChange={(open) => !open && setOpenId(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Audit entry</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            {detail.isError ? (
              <EmptyState tone="destructive" icon={AlertTriangle} title="Could not load this entry" description="Check your connection and try again." action={<Button onClick={() => void detail.refetch()}>Retry</Button>} />
            ) : detail.data ? (
              <DiffView log={detail.data} />
            ) : (
              <div role="status" aria-label="Loading"><Skeleton className="h-24 w-full" /></div>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function EntityLink({ log }: { log: AuditLog }) {
  const to = log.entity === 'lead' ? `/leads/${log.entityId}` : log.entity === 'deal' ? `/deals/${log.entityId}` : log.entity === 'user' ? '/team' : log.entity === 'setting' ? '/settings' : null
  const label = `${log.entity} · ${log.entityLabel}`
  return to ? <Link to={to}>{label}</Link> : <span>{label}</span>
}

function DiffView({ log }: { log: AuditLog }) {
  const keys = [...new Set([...Object.keys(log.previousValue ?? {}), ...Object.keys(log.newValue ?? {})])]
  return (
    <div className="space-y-3 text-sm">
      <p>{log.ip} · {log.device}</p>
      <EntityLink log={log} />
      <ul className="space-y-2">
        {keys.map((key) => (
          <li key={key} className="rounded-md border border-border p-2">
            <p className="font-medium">{titleCase(key)}</p>
            <p className="text-muted-foreground">Before: {String(log.previousValue?.[key] ?? '—')}</p>
            <p className="text-foreground">After: {String(log.newValue?.[key] ?? '—')}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
