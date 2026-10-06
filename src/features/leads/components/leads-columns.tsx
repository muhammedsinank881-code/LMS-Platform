import type { DataTableColumn } from '@/components/common/data-table'
import { CurrencyText } from '@/components/common/CurrencyText'
import { LeadScoreBadge } from '@/components/common/LeadScoreBadge'
import { SourceIcon } from '@/components/common/SourceIcon'
import { StatusBadge } from '@/components/common/StatusBadge'
import { UserAvatarCell } from '@/components/common/UserAvatarCell'
import { Checkbox } from '@/components/ui'
import { formatDate } from '@/lib/format'
import { EMPTY_VALUE } from '@/lib/format/shared'
import { formatPhone } from '@/lib/phone'
import type { Lead } from '@/types'
import { campaignById, sourceById, statusById, userById, type LeadLookups } from '../types'
import { LeadRowActions, type LeadRowActionsProps } from './LeadRowActions'
import { FollowUpTime, RelativeTime } from './RelativeTime'

export interface LeadColumnOptions extends Omit<LeadRowActionsProps, 'lead'> {
  lookups: LeadLookups
}

function stopRow(event: { stopPropagation: () => void }) {
  event.stopPropagation()
}

export function createLeadColumns(options: LeadColumnOptions): DataTableColumn<Lead>[] {
  const { lookups, ...actions } = options
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          size="sm"
          aria-label="Select all on this page"
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? 'indeterminate'
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
          onClick={stopRow}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          size="sm"
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value === true)}
          onClick={stopRow}
        />
      ),
      enableSorting: false,
      meta: { align: 'center', className: 'w-10 min-w-10 max-w-10 px-2' },
    },
    {
      accessorKey: 'id',
      header: 'Lead ID',
      meta: { className: 'min-w-[6.5rem]' },
      cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{row.original.id}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { className: 'min-w-[12rem]' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.company ?? EMPTY_VALUE}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      meta: { className: 'min-w-[9.5rem]' },
      cell: ({ row }) =>
        row.original.phone ? (
          <a
            className="text-primary hover:underline"
            href={`tel:${row.original.phone}`}
            onClick={stopRow}
          >
            {formatPhone(row.original.phone)}
          </a>
        ) : (
          EMPTY_VALUE
        ),
    },
    {
      accessorKey: 'sourceId',
      header: 'Source',
      meta: { className: 'min-w-[8.5rem]' },
      cell: ({ row }) => {
        const source = sourceById(lookups, row.original.sourceId)
        return (
          <span className="inline-flex max-w-[8.5rem] items-center gap-1.5">
            {source ? <SourceIcon icon={source.icon} /> : null}
            <span className="truncate">{source?.name ?? EMPTY_VALUE}</span>
          </span>
        )
      },
    },
    {
      accessorKey: 'campaignId',
      header: 'Campaign',
      meta: { className: 'min-w-[10rem]' },
      cell: ({ row }) => {
        const name = campaignById(lookups, row.original.campaignId)?.name ?? EMPTY_VALUE
        return <span className="block truncate">{name}</span>
      },
    },
    {
      accessorKey: 'statusId',
      header: 'Status',
      meta: { className: 'min-w-[7.5rem]' },
      cell: ({ row }) => {
        const status = statusById(lookups, row.original.statusId)
        return status ? <StatusBadge name={status.name} color={status.color} /> : EMPTY_VALUE
      },
    },
    {
      accessorKey: 'score',
      header: 'Score',
      meta: { className: 'min-w-[6.5rem]' },
      cell: ({ row }) => (
        <LeadScoreBadge score={row.original.score} category={row.original.scoreCategory} />
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned to',
      meta: { className: 'min-w-[9rem]' },
      cell: ({ row }) => {
        const user = userById(lookups, row.original.assignedTo)
        return <UserAvatarCell name={user?.name} src={user?.avatarUrl} className="max-w-[9rem]" />
      },
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      meta: { align: 'right', className: 'min-w-[6.5rem]' },
      cell: ({ row }) => <CurrencyText amount={row.original.budget} className="tabular-nums" />,
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      enableSorting: false,
      meta: { className: 'min-w-[7.5rem]' },
      cell: ({ row }) => {
        const [first, ...rest] = row.original.tags
        if (!first) return EMPTY_VALUE
        return (
          <span className="inline-flex items-center gap-1">
            <span className="max-w-[7rem] truncate rounded-full bg-muted px-2 py-0.5 text-xs">
              {first}
            </span>
            {rest.length > 0 ? (
              <span className="text-xs text-muted-foreground">+{rest.length}</span>
            ) : null}
          </span>
        )
      },
    },
    {
      accessorKey: 'lastContactedAt',
      header: 'Last contacted',
      meta: { className: 'min-w-[8rem]' },
      cell: ({ row }) => <RelativeTime value={row.original.lastContactedAt} />,
    },
    {
      accessorKey: 'nextFollowUpAt',
      header: 'Next follow-up',
      meta: { className: 'min-w-[8rem]' },
      cell: ({ row }) => <FollowUpTime value={row.original.nextFollowUpAt} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      meta: { className: 'min-w-[7rem]' },
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      meta: { align: 'center', className: 'w-12 min-w-12 max-w-12 px-1' },
      cell: ({ row }) => <LeadRowActions lead={row.original} {...actions} />,
    },
  ]
}
