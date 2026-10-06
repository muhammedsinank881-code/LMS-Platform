import { useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { BroadcastAudience, BroadcastInput, VariableMap } from '@/types'

const POLL_MS = 1500

/** Polls while any broadcast is sending: each read moves the simulated send forward one batch. */
export function useBroadcasts() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.broadcasts.list,
    queryFn: () => api.broadcasts.list(),
    enabled: ready,
    refetchInterval: (query) =>
      query.state.data?.some((item) => item.status === 'sending' || item.status === 'scheduled') ? POLL_MS : false,
  })
}

export function useAudienceCount(audience: BroadcastAudience | null) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.broadcasts.audience(audience),
    queryFn: () => api.broadcasts.audienceCount(audience as BroadcastAudience),
    enabled: ready && audience !== null,
  })
}

export function useBroadcastPreview(
  templateId: string | null,
  variableMap: VariableMap,
  audience: BroadcastAudience | null,
) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.broadcasts.preview(templateId, variableMap, audience),
    queryFn: () => api.broadcasts.preview(templateId ?? '', variableMap, audience as BroadcastAudience),
    enabled: ready && Boolean(templateId) && audience !== null,
  })
}

export function useCreateBroadcast() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: BroadcastInput) => api.broadcasts.create(input),
    onSuccess: () => invalidate('broadcasts', 'auditLogs'),
    meta: { errorTitle: 'Could not create the broadcast' },
  })
}

export function useCancelBroadcast() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.broadcasts.cancel(id),
    onSuccess: () => invalidate('broadcasts', 'auditLogs'),
    meta: { errorTitle: 'Could not cancel the broadcast' },
  })
}
