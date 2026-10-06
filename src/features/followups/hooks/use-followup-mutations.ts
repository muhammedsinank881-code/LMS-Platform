import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { patchOptimistically, rollbackOptimistic } from '@/lib/optimistic'
import type { ResourceName } from '@/lib/queryKeys'
import { api } from '@/services'
import type {
  CompleteFollowUpInput,
  CreateFollowUpInput,
  FollowUp,
  RescheduleFollowUpInput,
  UpdateFollowUpInput,
} from '@/types'

/** A follow-up also moves the lead's next follow-up date, its timeline and the dashboards. */
const FOLLOWUP_RELATED: ResourceName[] = ['followUps', 'leads', 'reports', 'notifications']

function useFollowUpSettled() {
  const invalidate = useInvalidate()
  return () => invalidate(...FOLLOWUP_RELATED)
}

export function useCreateFollowUp() {
  const settled = useFollowUpSettled()
  return useMutation({
    mutationFn: (input: CreateFollowUpInput) => api.followUps.create(input),
    onSuccess: settled,
    meta: { errorTitle: 'Could not schedule follow-up' },
  })
}

export function useUpdateFollowUp() {
  const settled = useFollowUpSettled()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateFollowUpInput }) =>
      api.followUps.update(id, patch),
    onSuccess: settled,
    meta: { errorTitle: 'Could not update follow-up' },
  })
}

export function useDeleteFollowUp() {
  const settled = useFollowUpSettled()
  return useMutation({
    mutationFn: (id: string) => api.followUps.delete(id),
    onSuccess: settled,
    meta: { errorTitle: 'Could not delete follow-up' },
  })
}

export function useRescheduleFollowUp() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RescheduleFollowUpInput }) =>
      api.followUps.reschedule(id, input),
    onMutate: async ({ id, input }) => ({
      snapshot: await patchOptimistically<FollowUp>(
        queryClient,
        [keys.followUps.lists, keys.followUps.detail(id)],
        id,
        (followUp) => {
          const due = new Date(input.dueAt)
          let status = followUp.status
          if (status !== 'done') status = due.getTime() < Date.now() ? 'overdue' : 'pending'
          return { ...followUp, dueAt: due.toISOString(), status }
        },
      ),
    }),
    onError: (_error, _variables, context) => rollbackOptimistic(queryClient, context?.snapshot),
    onSettled: () => invalidate(...FOLLOWUP_RELATED),
    meta: { errorTitle: 'Could not reschedule follow-up' },
  })
}

export function useSnoozeFollowUp() {
  const settled = useFollowUpSettled()
  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) => api.followUps.snooze(id, minutes),
    onSuccess: settled,
    meta: { errorTitle: 'Could not snooze follow-up' },
  })
}

/** Ticks a follow-up off in every cached list at once; it reappears if the server says no. */
export function useCompleteFollowUp() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: ({ id, ...input }: CompleteFollowUpInput & { id: string }) =>
      api.followUps.complete(id, input),
    onMutate: async ({ id, note }) => ({
      snapshot: await patchOptimistically<FollowUp>(
        queryClient,
        [keys.followUps.lists, keys.followUps.detail(id)],
        id,
        (followUp) => ({
          ...followUp,
          status: 'done',
          completedAt: new Date().toISOString(),
          completionNote: note ?? followUp.completionNote ?? null,
        }),
      ),
    }),
    onError: (_error, _variables, context) => rollbackOptimistic(queryClient, context?.snapshot),
    onSettled: () => invalidate(...FOLLOWUP_RELATED),
    meta: { errorTitle: 'Could not complete follow-up' },
  })
}
