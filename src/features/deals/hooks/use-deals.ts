import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { patchOptimistically, rollbackOptimistic } from '@/lib/optimistic'
import type { ResourceName } from '@/lib/queryKeys'
import { api } from '@/services'
import type {
  CreateDealInput,
  Deal,
  DealId,
  DealListParams,
  LeadId,
  MoveDealStageInput,
  UpdateDealInput,
} from '@/types'

/** Deals feed the pipeline board, reports, the lead's own history and customer lifetime value. */
const DEAL_RELATED: ResourceName[] = ['deals', 'leads', 'customers', 'reports', 'auditLogs', 'notifications']

export function useDeals(params?: DealListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.deals.list(params),
    queryFn: () => api.deals.list(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useDeal(id: DealId | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.deals.detail(id ?? ''),
    queryFn: () => api.deals.get(id as DealId),
    enabled: ready && Boolean(id),
  })
}

/** Open-pipeline totals and a row per stage. */
export function useDealsSummary(params?: DealListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.deals.summary(params),
    queryFn: () => api.deals.getSummary(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useCreateDeal() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: CreateDealInput) => api.deals.create(input),
    onSuccess: () => invalidate(...DEAL_RELATED),
    meta: { errorTitle: 'Could not create deal' },
  })
}

export function useCreateDealFromLead() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ leadId, input }: { leadId: LeadId; input: Omit<CreateDealInput, 'leadId'> }) =>
      api.deals.createFromLead(leadId, input),
    onSuccess: () => invalidate(...DEAL_RELATED),
    meta: { errorTitle: 'Could not create deal' },
  })
}

export function useUpdateDeal() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, patch }: { id: DealId; patch: UpdateDealInput }) => api.deals.update(id, patch),
    onSuccess: () => invalidate(...DEAL_RELATED),
    meta: { errorTitle: 'Could not update deal' },
  })
}

export function useDeleteDeal() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: DealId) => api.deals.delete(id),
    onSuccess: () => invalidate(...DEAL_RELATED),
    meta: { errorTitle: 'Could not delete deal' },
  })
}

/**
 * Drag a deal to another stage: the card lands there immediately and snaps back if the server
 * refuses (e.g. Lost without a reason). Totals are refetched once the server has answered.
 */
export function useMoveDealStage() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: ({ id, ...input }: MoveDealStageInput & { id: DealId }) => api.deals.moveStage(id, input),
    onMutate: async ({ id, stageId, lostReasonId }) => ({
      snapshot: await patchOptimistically<Deal>(
        queryClient,
        [keys.deals.lists, keys.deals.detail(id)],
        id,
        (deal) => ({ ...deal, stageId, lostReasonId: lostReasonId ?? deal.lostReasonId }),
      ),
    }),
    onError: (_error, _variables, context) => rollbackOptimistic(queryClient, context?.snapshot),
    onSettled: () => invalidate(...DEAL_RELATED),
    meta: { errorTitle: 'Could not move deal' },
  })
}
