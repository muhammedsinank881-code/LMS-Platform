import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { SpendImportRow, SpendInput, SpendListParams } from '@/types'

export function useSpendEntries(params: SpendListParams, enabled = true) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.spend.list(params),
    queryFn: () => api.spend.list(params),
    enabled: ready && enabled,
    placeholderData: keepPreviousData,
  })
}

function useSpendMutation<V, R>(run: (value: V) => Promise<R>, errorTitle: string) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: run,
    onSuccess: () => invalidate('spend', 'campaigns', 'reports', 'auditLogs'),
    meta: { errorTitle },
  })
}

export const useCreateSpend = () =>
  useSpendMutation((input: SpendInput) => api.spend.create(input), 'Could not add the spend entry')

export const useUpdateSpend = () =>
  useSpendMutation(
    ({ id, patch }: { id: string; patch: Partial<SpendInput> }) => api.spend.update(id, patch),
    'Could not save the spend entry',
  )

export const useDeleteSpend = () =>
  useSpendMutation((id: string) => api.spend.delete(id), 'Could not delete the spend entry')

export const useImportSpend = () =>
  useSpendMutation(
    ({ campaignId, rows }: { campaignId: string; rows: SpendImportRow[] }) =>
      api.spend.importCsv(campaignId, rows),
    'Could not import spend',
  )
