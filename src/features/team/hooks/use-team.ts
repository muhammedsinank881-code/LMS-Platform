import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type {
  DeactivateMemberInput,
  InviteMemberInput,
  MemberFilterField,
  TeamInput,
  UpdateMemberInput,
} from '@/services/api/team'
import type { ListParams } from '@/types'

/** Names, roles and teams of everyone in the workspace. Open to every role, for assignee pickers. */
export function useDirectory() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.team.directory,
    queryFn: () => api.team.directory(),
    enabled: ready,
    staleTime: 5 * 60_000,
  })
}

export function useMembers(params?: ListParams<MemberFilterField>) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.team.members(params),
    queryFn: () => api.team.listMembers(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useMember(id: string | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.team.member(id ?? ''),
    queryFn: () => api.team.getMember(id ?? ''),
    enabled: ready && Boolean(id),
  })
}

export function useTeams() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.team.teams,
    queryFn: () => api.team.listTeams(),
    enabled: ready,
    staleTime: 5 * 60_000,
  })
}

/** Role and team changes alter every user's data scope, so lead data refetches too. */
export function useInviteMember() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: InviteMemberInput) => api.team.invite(input),
    onSuccess: () => invalidate('team', 'auditLogs'),
    meta: { errorTitle: 'Could not invite member' },
  })
}

export function useUpdateMember() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateMemberInput }) =>
      api.team.updateMember(id, patch),
    onSuccess: () => invalidate('team', 'leads', 'auditLogs'),
    meta: { errorTitle: 'Could not update member' },
  })
}

export function useCreateTeam() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: TeamInput) => api.team.createTeam(input),
    onSuccess: () => invalidate('team'),
    meta: { errorTitle: 'Could not create team' },
  })
}

export function useUpdateTeam() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TeamInput> }) => api.team.updateTeam(id, patch),
    onSuccess: () => invalidate('team'),
    meta: { errorTitle: 'Could not save team' },
  })
}

export function useInvitations() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: [...keys.team.all, 'invitations'] as const,
    queryFn: () => api.team.listInvitations(),
    enabled: ready,
  })
}

export function useResendInvitation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.team.resendInvitation(id),
    onSuccess: () => invalidate('team'),
    meta: { errorTitle: 'Could not resend invitation' },
  })
}

export function useRevokeInvitation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.team.revokeInvitation(id),
    onSuccess: () => invalidate('team', 'auditLogs'),
    meta: { errorTitle: 'Could not revoke invitation' },
  })
}

export function useDeactivateMember() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DeactivateMemberInput }) =>
      api.team.deactivateMember(id, input),
    onSuccess: () => invalidate('team', 'leads', 'auditLogs'),
    meta: { errorTitle: 'Could not deactivate member' },
  })
}

export function useDeleteTeam() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.team.deleteTeam(id),
    onSuccess: () => invalidate('team'),
    meta: { errorTitle: 'Could not delete team' },
  })
}
