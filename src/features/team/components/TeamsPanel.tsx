import { useState } from 'react'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { queryBlocked } from '@/components/common/query-blocked'
import { Button, EmptyState, Input, Select, toast } from '@/components/ui'
import { Inbox } from 'lucide-react'
import { COLOR_PRESETS } from '@/lib/settings/palette'
import { useCreateTeam, useDeleteTeam, useDirectory, useTeams, useUpdateTeam } from '../hooks/use-team'

export function TeamsPanel({ canEdit }: { canEdit: boolean }) {
  const teams = useTeams()
  const users = useDirectory()
  const create = useCreateTeam()
  const update = useUpdateTeam()
  const remove = useDeleteTeam()
  const [name, setName] = useState('')
  const blocked = queryBlocked(teams)
  if (blocked) return blocked
  const rows = teams.data ?? []
  return (
    <div className="mt-4 space-y-3">
      {canEdit ? (
        <ControlRow>
          <ControlField grow label="New team">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Team name" />
          </ControlField>
          <Button className="shrink-0" onClick={() => name.trim() && create.mutate({ name: name.trim(), leaderId: null, color: COLOR_PRESETS[0] }, { onSuccess: () => { setName(''); toast.success('Team created') } })}>Add team</Button>
        </ControlRow>
      ) : null}
      <ul className="space-y-3">
        {rows.length === 0 ? <EmptyState icon={Inbox} title="No teams yet" description="Add a team to group members." /> : null}
        {rows.map((team) => {
          const members = (users.data ?? []).filter((user) => user.teamId === team.id)
          return (
            <li key={team.id} className="rounded-md border border-border p-3">
              <ControlRow>
                <ControlField grow label="Name">
                  <Input defaultValue={team.name} disabled={!canEdit} onBlur={(event) => canEdit && event.target.value !== team.name && update.mutate({ id: team.id, patch: { name: event.target.value } })} />
                </ControlField>
                <ControlField label="Leader">
                  <Select
                    value={team.leaderId ?? 'none'}
                    disabled={!canEdit}
                    options={[{ value: 'none', label: 'No leader' }, ...members.map((user) => ({ value: user.id, label: user.name }))]}
                    onValueChange={(leaderId) => update.mutate({ id: team.id, patch: { leaderId: leaderId === 'none' ? null : leaderId } })}
                  />
                </ControlField>
                {canEdit ? <Button className="shrink-0" variant="outline" onClick={() => remove.mutate(team.id, { onSuccess: () => toast.success('Team deleted') })}>Delete</Button> : null}
              </ControlRow>
              <p className="mt-2 text-sm text-muted-foreground">{members.map((user) => user.name).join(', ') || 'No members'}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
