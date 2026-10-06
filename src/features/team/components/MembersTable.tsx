import { useState } from 'react'
import type { DataTableColumn } from '@/components/common/data-table/types'
import { DataTable } from '@/components/common/data-table'
import { UserAvatarCell } from '@/components/common/UserAvatarCell'
import { Badge } from '@/components/ui'
import { ROLE_LABELS } from '@/lib/permissions'
import { formatDate } from '@/lib/format/date'
import type { Member } from '@/services/api/team'
import { useMembers, useTeams } from '../hooks/use-team'
import { MemberDrawer } from './MemberDrawer'

const STATUS_TONE = { active: 'success', invited: 'info', inactive: 'neutral' } as const

export function MembersTable({
  search,
  role,
  teamId,
  status,
  page,
  pageSize,
  onPageChange,
  canEdit,
}: {
  search: string
  role: string
  teamId: string
  status: string
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  canEdit: boolean
}) {
  const members = useMembers({
    page,
    pageSize,
    search,
    filters: [
      ...(role ? [{ field: 'role' as const, operator: 'equals' as const, value: role }] : []),
      ...(teamId ? [{ field: 'teamId' as const, operator: 'equals' as const, value: teamId }] : []),
      ...(status ? [{ field: 'status' as const, operator: 'equals' as const, value: status }] : []),
    ],
  })
  const teams = useTeams()
  const [openId, setOpenId] = useState<string | null>(null)
  const teamName = (id: string | null) => teams.data?.find((team) => team.id === id)?.name ?? '—'
  const columns: DataTableColumn<Member>[] = [
    { id: 'name', header: 'Member', cell: ({ row }) => <UserAvatarCell name={row.original.name} src={row.original.avatarUrl} /> },
    { id: 'role', header: 'Role', cell: ({ row }) => <Badge>{ROLE_LABELS[row.original.role]}</Badge> },
    { id: 'team', header: 'Team', cell: ({ row }) => teamName(row.original.teamId) },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge tone={STATUS_TONE[row.original.status]} dot>
          {row.original.status === 'inactive' ? 'Deactivated' : row.original.status === 'invited' ? 'Invited' : 'Active'}
        </Badge>
      ),
    },
    { id: 'workload', header: 'Workload', cell: ({ row }) => `${row.original.openLeads} leads · ${row.original.openFollowUps} follow-ups` },
    { id: 'active', header: 'Last active', cell: ({ row }) => (row.original.lastActiveAt ? formatDate(row.original.lastActiveAt) : '—') },
    { id: 'joined', header: 'Joined', cell: ({ row }) => formatDate(row.original.createdAt) },
  ]
  return (
    <>
      <DataTable
        columns={columns}
        data={members.data?.items ?? []}
        getRowId={(row) => row.id}
        page={page}
        pageSize={pageSize}
        total={members.data?.total ?? 0}
        sort={[{ field: 'name', direction: 'asc' }]}
        onPageChange={onPageChange}
        onPageSizeChange={() => undefined}
        onSortChange={() => undefined}
        density="comfortable"
        columnVisibility={{}}
        onColumnVisibilityChange={() => undefined}
        selectedIds={[]}
        selectionMode="page"
        onSelectionChange={() => undefined}
        isLoading={members.isLoading}
        isError={members.isError}
        onRetry={() => members.refetch()}
        empty={<p className="text-sm text-muted-foreground">No members match.</p>}
        mode="table"
        renderCard={(row) => <p>{row.name}</p>}
        onRowClick={canEdit ? (row) => setOpenId(row.id) : undefined}
      />
      <MemberDrawer memberId={openId} onOpenChange={(open) => !open && setOpenId(null)} />
    </>
  )
}
