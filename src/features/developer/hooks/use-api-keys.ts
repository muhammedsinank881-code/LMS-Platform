import { useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { CreateApiKeyInput } from '@/types'

export function useApiKeys() {
  const { keys, ready } = useWorkspace()
  return useQuery({ queryKey: keys.apiKeys.list, queryFn: () => api.apiKeys.list(), enabled: ready })
}

export function useApiKeySummary() {
  const { keys, ready } = useWorkspace()
  return useQuery({ queryKey: keys.apiKeys.summary, queryFn: () => api.apiKeys.summary(), enabled: ready })
}

/**
 * Create and rotate return the full key once. `gcTime: 0` drops the mutation (and its result)
 * the moment nobody observes it, and callers copy the secret into local state, then `reset()`.
 */
export function useCreateApiKey() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: CreateApiKeyInput) => api.apiKeys.create(input),
    onSuccess: () => invalidate('apiKeys', 'auditLogs'),
    gcTime: 0,
    meta: { errorTitle: 'Could not create the key' },
  })
}

export function useRotateApiKey() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: { id: string; graceHours: number }) => api.apiKeys.rotate(input.id, input.graceHours),
    onSuccess: () => invalidate('apiKeys', 'auditLogs'),
    gcTime: 0,
    meta: { errorTitle: 'Could not rotate the key' },
  })
}

export function useRevokeApiKey() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.apiKeys.revoke(id),
    onSuccess: () => invalidate('apiKeys', 'auditLogs'),
    meta: { errorTitle: 'Could not revoke the key' },
  })
}
