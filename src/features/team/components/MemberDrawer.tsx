import { useState } from 'react'
import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle, Select, toast } from '@/components/ui'
import { useAuthStore } from '@/store/auth-store'
import { ROLE_LABELS } from '@/lib/permissions'
import { ROLES, type Role } from '@/types'
import { useDeactivateMember, useDirectory, useMember, useTeams, useUpdateMember } from '../hooks/use-team'

export function MemberDrawer({ memberId, onOpenChange }: { memberId: string | null; onOpenChange: (open: boolean) => void }) {
  const member = useMember(memberId)
  const update = useUpdateMember()
  const deactivate = useDeactivateMember()
  const teams = useTeams()
  const users = useDirectory()
  const me = useAuthStore((state) => state.user?.id)
  const [assignee, setAssignee] = useState('')
  const person = member.data
  const self = person?.id === me
  return (
    <Drawer open={memberId !== null} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{person?.name ?? 'Member'}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="space-y-3">
          {person ? (
            <>
              <Select
                aria-label="Role"
                value={person.role}
                disabled={self}
                options={ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
                onValueChange={(role) => update.mutate({ id: person.id, patch: { role: role as Role } }, { onSuccess: () => toast.success('Role updated') })}
              />
              <Select
                aria-label="Team"
                value={person.teamId ?? 'none'}
                options={[{ value: 'none', label: 'No team' }, ...(teams.data ?? []).map((team) => ({ value: team.id, label: team.name }))]}
                onValueChange={(teamId) => update.mutate({ id: person.id, patch: { teamId: teamId === 'none' ? null : teamId } })}
              />
              {person.status === 'inactive' ? (
                <Button onClick={() => update.mutate({ id: person.id, patch: { status: 'active' } }, { onSuccess: () => toast.success('Member reactivated') })}>Reactivate</Button>
              ) : (
                <div className="space-y-2">
                  <Select aria-label="Reassign open leads" value={assignee || 'rules'} options={[{ value: 'rules', label: 'Use assignment rules' }, ...(users.data ?? []).filter((user) => user.id !== person.id).map((user) => ({ value: user.id, label: user.name }))]} onValueChange={setAssignee} />
                  <Button
                    variant="destructive"
                    disabled={self}
                    onClick={() =>
                      deactivate.mutate(
                        { id: person.id, input: assignee && assignee !== 'rules' ? { mode: 'user', userId: assignee } : { mode: 'rules' } },
                        { onSuccess: () => toast.success('Member deactivated') },
                      )
                    }
                  >
                    Deactivate
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Loading member…</p>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
