import { useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { AdInput, AdSetInput } from '@/types'

/** Ad sets and ads of one campaign, for the spend form's pickers. */
export function useAdHierarchy(campaignId: string | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.adSets.list(campaignId ?? ''),
    queryFn: async () => {
      const [adSets, ads] = await Promise.all([
        api.adSets.listAdSets(campaignId ?? ''),
        api.adSets.listAds(campaignId ?? ''),
      ])
      return { adSets, ads }
    },
    enabled: ready && Boolean(campaignId),
  })
}

function useHierarchyMutation<V, R>(run: (value: V) => Promise<R>, errorTitle: string) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: run,
    onSuccess: () => invalidate('adSets', 'campaigns', 'auditLogs'),
    meta: { errorTitle },
  })
}

export const useCreateAdSet = () =>
  useHierarchyMutation((input: AdSetInput) => api.adSets.createAdSet(input), 'Could not add the ad set')

export const useCreateAd = () =>
  useHierarchyMutation((input: AdInput) => api.adSets.createAd(input), 'Could not add the ad')
