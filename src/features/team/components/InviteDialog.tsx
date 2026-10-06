import { useState } from 'react'
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle, Select, toast } from '@/components/ui'
import { ROLE_LABELS } from '@/lib/permissions'
import { ROLES } from '@/types'
import { useInvitations, useInviteMember, useResendInvitation, useRevokeInvitation, useTeams } from '../hooks/use-team'

export function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const invite = useInviteMember()
  const invitations = useInvitations()
  const resend = useResendInvitation()
  const revoke = useRevokeInvitation()
  const teams = useTeams()
  const [emails, setEmails] = useState('')
  const [role, setRole] = useState<(typeof ROLES)[number]>('salesperson')
  const [teamId, setTeamId] = useState('')
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Invite members</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-3">
          <Input aria-label="Emails" value={emails} onChange={(event) => setEmails(event.target.value)} placeholder="a@acme.test, b@acme.test" />
          <Select aria-label="Role" value={role} options={ROLES.filter((item) => item !== 'super_admin').map((item) => ({ value: item, label: ROLE_LABELS[item] }))} onValueChange={(value) => setRole(value as typeof role)} />
          <Select aria-label="Team" value={teamId || 'none'} options={[{ value: 'none', label: 'No team' }, ...(teams.data ?? []).map((team) => ({ value: team.id, label: team.name }))]} onValueChange={(value) => setTeamId(value === 'none' ? '' : value)} />
          <ul className="space-y-2 text-sm">
            {(invitations.data ?? []).map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>{item.email}</span>
                <span className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(`${window.location.origin}/accept-invite?token=${item.token}`); toast.success('Invite link copied') }}>Copy link</Button>
                  <Button size="sm" variant="outline" onClick={() => resend.mutate(item.id, { onSuccess: () => toast.success('Invitation resent') })}>Resend</Button>
                  <Button size="sm" variant="outline" onClick={() => revoke.mutate(item.id)}>Revoke</Button>
                </span>
              </li>
            ))}
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button
            loading={invite.isPending}
            onClick={() =>
              invite.mutate(
                { emails: emails.split(/[,\s]+/).filter(Boolean), role, teamId: teamId || null },
                { onSuccess: () => { setEmails(''); toast.success('Invitations sent') } },
              )
            }
          >
            Send invites
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
