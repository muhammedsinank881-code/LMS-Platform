import { Link } from 'react-router-dom'
import type { DataTableColumn } from '@/components/common/data-table'
import { UserAvatarCell } from '@/components/common/UserAvatarCell'
import { Badge, Checkbox, Switch } from '@/components/ui'
import { describeTrigger, type Lookups } from '@/lib/automation'
import { formatRelative } from '@/lib/format/date'
import type { Automation } from '@/types'

const stop = (event: { stopPropagation: () => void }) => event.stopPropagation()

/** Share of runs that did not fail. Null until it has run. */
export function successRate(a: Pick<Automation, 'runCount' | 'errorCount'>): number | null {
  return a.runCount === 0 ? null : Math.max(0, 1 - a.errorCount / a.runCount)
}

export const triggerSentence = (a: Automation, lookups: Lookups) => {
  const text = describeTrigger(a.trigger, lookups)
  return `When ${text}`
}

export function createAutomationColumns({
  lookups,
  userName,
  canEdit,
  onToggle,
}: {
  lookups: Lookups
  userName: (id: string | null) => string | null
  canEdit: boolean
  onToggle: (automation: Automation, enabled: boolean) => void
}): DataTableColumn<Automation>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          size="sm"
          aria-label="Select all automations on this page"
          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
          onClick={stop}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          size="sm"
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value === true)}
          onClick={stop}
        />
      ),
      enableSorting: false,
      meta: { align: 'center', className: 'w-10 min-w-10 max-w-10 px-2' },
    },
    {
      accessorKey: 'name',
      header: 'Automation',
      meta: { className: 'min-w-[14rem]' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <Link to={`/automations/${row.original.id}`} className="block truncate font-medium text-foreground hover:underline" onClick={stop}>
            {row.original.name}
          </Link>
          {row.original.status === 'draft' ? (
            <Badge size="sm" tone="neutral">
              Draft
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      id: 'trigger',
      header: 'Trigger',
      enableSorting: false,
      meta: { className: 'min-w-[14rem]' },
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{triggerSentence(row.original, lookups)}</span>,
    },
    {
      accessorKey: 'enabled',
      header: 'Status',
      cell: ({ row }) => {
        const a = row.original
        return (
          <span className="inline-flex items-center gap-2">
            <Switch
              size="sm"
              checked={a.enabled}
              disabled={!canEdit || a.status !== 'published'}
              aria-label={`${a.name} is ${a.enabled ? 'on' : 'off'}`}
              onClick={stop}
              onCheckedChange={(value) => onToggle(a, value)}
            />
            <span className="text-sm">{a.enabled ? 'On' : a.status === 'draft' ? 'Draft' : 'Off'}</span>
          </span>
        )
      },
    },
    {
      accessorKey: 'runCount',
      header: 'Runs',
      meta: { align: 'right' },
      cell: ({ row }) => <span className="tabular-nums">{row.original.runCount}</span>,
    },
    {
      id: 'successRate',
      header: 'Success rate',
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => {
        const rate = successRate(row.original)
        return <span className="tabular-nums">{rate === null ? '—' : `${Math.round(rate * 100)}%`}</span>
      },
    },
    {
      id: 'lastRunAt',
      header: 'Last run',
      enableSorting: false,
      cell: ({ row }) => (row.original.lastRunAt ? formatRelative(row.original.lastRunAt) : <span className="text-muted-foreground">Never</span>),
    },
    {
      id: 'owner',
      header: 'Owner',
      enableSorting: false,
      cell: ({ row }) => <UserAvatarCell name={userName(row.original.createdBy)} />,
    },
  ]
}
