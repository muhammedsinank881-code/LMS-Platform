import { useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { ActivityListParams, BulkDealStageInput, DealId, DealListParams, ManualActivityInput, ReopenDealInput } from '@/types'

const RELATED = ['deals', 'leads', 'customers', 'pipelineBoard', 'auditLogs'] as const

export function useDealActivities(id: DealId | undefined, params?: ActivityListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.deals.activities(id ?? '', params),
    queryFn: () => api.deals.listActivities(id as DealId, params),
    enabled: ready && Boolean(id),
  })
}

export function useAddDealNote() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, text }: { id: DealId; text: string }) => {
      const input: ManualActivityInput = { type: 'note', data: { text } }
      return api.deals.addActivity(id, input)
    },
    onSuccess: () => invalidate(...RELATED),
    meta: { errorTitle: 'Could not add note' },
  })
}

export function useReopenDeal() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, input }: { id: DealId; input: ReopenDealInput }) => api.deals.reopen(id, input),
    onSuccess: () => invalidate(...RELATED),
    meta: { errorTitle: 'Could not reopen deal' },
  })
}

export function useBulkDealStage() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: BulkDealStageInput) => api.deals.bulkMoveStage(input),
    onSuccess: () => invalidate(...RELATED),
    meta: { errorTitle: 'Could not change stage' },
  })
}

export function useBulkAssignDeals() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ ids, ownerId }: { ids: DealId[]; ownerId: string }) => api.deals.bulkAssign(ids, ownerId),
    onSuccess: () => invalidate(...RELATED),
    meta: { errorTitle: 'Could not assign deals' },
  })
}

export function useBulkDeleteDeals() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (ids: DealId[]) => api.deals.bulkDelete(ids),
    onSuccess: () => invalidate(...RELATED),
    meta: { errorTitle: 'Could not delete deals' },
  })
}

export function useExportDeals() {
  return useMutation({
    mutationFn: (params?: DealListParams) => api.deals.exportRows(params),
    meta: { errorTitle: 'Export failed' },
  })
}
