import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { patchOptimistically, rollbackOptimistic } from '@/lib/optimistic'
import { api } from '@/services'
import type { ChangeLeadStatusInput } from '@/services/api/leads'
import type { Lead, LeadId } from '@/types'
import { LEAD_RELATED } from './use-lead-mutations'

/**
 * Moves a lead to another status. The lead jumps to its new status in every cached list and
 * detail straight away; if the server refuses (e.g. Lost without a reason) it jumps back and the
 * global toast explains why.
 */
export function useChangeLeadStatus() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: ({ id, ...input }: ChangeLeadStatusInput & { id: LeadId }) =>
      api.leads.changeStatus(id, input),
    onMutate: async ({ id, statusId, lostReasonId }) => ({
      snapshot: await patchOptimistically<Lead>(
        queryClient,
        [keys.leads.lists, keys.leads.detail(id)],
        id,
        (lead) => ({ ...lead, statusId, lostReasonId: lostReasonId ?? null }),
      ),
    }),
    onError: (_error, _variables, context) => rollbackOptimistic(queryClient, context?.snapshot),
    onSettled: () => invalidate(...LEAD_RELATED),
    meta: { errorTitle: 'Could not change status' },
  })
}
