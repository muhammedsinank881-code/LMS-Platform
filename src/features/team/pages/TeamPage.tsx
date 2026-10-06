import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { NoAccess } from '@/components/common/NoAccess'
import { SearchInput } from '@/components/common/SearchInput'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Select, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useListUrlState } from '@/hooks/use-list-url-state'
import { usePermission } from '@/hooks/use-permission'
import { ROLE_LABELS } from '@/lib/permissions'
import { ROLES, USER_STATUSES } from '@/types'
import { InviteDialog } from '../components/InviteDialog'
import { MembersTable } from '../components/MembersTable'
import { RolesPanel } from '../components/RolesPanel'
import { TeamsPanel } from '../components/TeamsPanel'
import { useTeams } from '../hooks/use-team'

const STATUS_LABELS: Record<(typeof USER_STATUSES)[number], string> = {
  active: 'Active',
  invited: 'Invited',
  inactive: 'Deactivated',
}

export function TeamPage() {
  const { can } = usePermission()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'members'
  const url = useListUrlState({ sort: [{ field: 'name', direction: 'asc' as const }] })
  const teams = useTeams()
  const [role, setRole] = useState('')
  const [teamId, setTeamId] = useState('')
  const [status, setStatus] = useState('')
  const [invite, setInvite] = useState(false)
  if (!can('team', 'view')) return <NoAccess title="You don't have access to the team" />
  const manage = can('team', 'create') || can('team', 'edit')
  const setFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value === 'all' ? '' : value)
    url.setPage(1)
  }
  return (
    <div>
      <PageHeader
        title="Team"
        description={manage ? 'Invite people, set roles, and group them into teams.' : 'Your team, read only.'}
        actions={manage && tab === 'members' ? <Button onClick={() => setInvite(true)}>Invite</Button> : null}
      />
      <Tabs value={tab} onValueChange={(value) => setParams({ tab: value })}>
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          {manage ? <TabsTrigger value="roles">Roles & permissions</TabsTrigger> : null}
        </TabsList>
        <TabsContent value="members" forceMount className="sr-only">Members</TabsContent>
        <TabsContent value="teams" forceMount className="sr-only">Teams</TabsContent>
        {manage ? <TabsContent value="roles" forceMount className="sr-only">Roles and permissions</TabsContent> : null}
      </Tabs>
      {tab === 'members' ? (
        <ControlRow className="mt-3">
          <ControlField grow label="Search">
            <SearchInput defaultValue={url.search} onValueChange={url.setSearch} placeholder="Search members" />
          </ControlField>
          <ControlField label="Role">
            <Select
              value={role || 'all'}
              options={[{ value: 'all', label: 'All roles' }, ...ROLES.map((item) => ({ value: item, label: ROLE_LABELS[item] }))]}
              onValueChange={setFilter(setRole)}
            />
          </ControlField>
          <ControlField label="Team">
            <Select
              value={teamId || 'all'}
              options={[{ value: 'all', label: 'All teams' }, ...(teams.data ?? []).map((team) => ({ value: team.id, label: team.name }))]}
              onValueChange={setFilter(setTeamId)}
            />
          </ControlField>
          <ControlField label="Status">
            <Select
              value={status || 'all'}
              options={[{ value: 'all', label: 'All statuses' }, ...USER_STATUSES.map((item) => ({ value: item, label: STATUS_LABELS[item] }))]}
              onValueChange={setFilter(setStatus)}
            />
          </ControlField>
        </ControlRow>
      ) : null}
      {tab === 'teams' ? <TeamsPanel canEdit={manage} /> : null}
      {tab === 'roles' && manage ? <RolesPanel /> : null}
      {tab === 'members' ? (
        <div className="mt-4">
          <MembersTable
            search={url.search}
            role={role}
            teamId={teamId}
            status={status}
            page={url.page}
            pageSize={url.pageSize}
            onPageChange={url.setPage}
            canEdit={can('team', 'edit')}
          />
        </div>
      ) : null}
      <InviteDialog open={invite} onOpenChange={setInvite} />
    </div>
  )
}
