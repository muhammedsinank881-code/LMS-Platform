import { useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { WebhookEndpoint, WebhookEvent, WebhookInput, WebhookOutcome } from '@/types'

export function useWebhooks() {
  const { keys, ready } = useWorkspace()
  return useQuery({ queryKey: keys.webhooks.list, queryFn: () => api.webhooks.list(), enabled: ready })
}

/** Endpoint choices for the automation builder's "Call a webhook" action. */
export function useWebhookOptions() {
  const { keys, ready } = useWorkspace()
  return useQuery({ queryKey: keys.webhooks.options, queryFn: () => api.webhooks.options(), enabled: ready })
}

export function useDeliveries(endpointId: string | null) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.webhooks.deliveries(endpointId ?? ''),
    queryFn: () => api.webhooks.deliveries(endpointId as string),
    enabled: ready && endpointId !== null,
    // The retry queue advances with time, so keep an open log fresh.
    refetchInterval: 10_000,
  })
}

/** Create and rotate return the signing secret once, so their state is dropped immediately. */
export function useSaveWebhook() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: { id: string | null; values: WebhookInput }): Promise<{ endpoint: WebhookEndpoint; secret: string | null }> =>
      input.id ? api.webhooks.update(input.id, input.values).then((endpoint) => ({ endpoint, secret: null })) : api.webhooks.create(input.values),
    onSuccess: () => invalidate('webhooks', 'auditLogs'),
    gcTime: 0,
    meta: { errorTitle: 'Could not save the endpoint' },
  })
}

export function useRotateWebhookSecret() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.webhooks.rotateSecret(id),
    onSuccess: () => invalidate('webhooks', 'auditLogs'),
    gcTime: 0,
    meta: { errorTitle: 'Could not rotate the secret' },
  })
}

export function useRemoveWebhook() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.webhooks.remove(id),
    onSuccess: () => invalidate('webhooks', 'auditLogs'),
    meta: { errorTitle: 'Could not delete the endpoint' },
  })
}

export function useRedeliver() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (deliveryId: string) => api.webhooks.redeliver(deliveryId),
    onSuccess: () => invalidate('webhooks'),
    meta: { errorTitle: 'Could not redeliver' },
  })
}

export function useSendTestEvent() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: { endpointId: string; event: WebhookEvent; outcome?: WebhookOutcome }) =>
      api.webhooks.sendTest(input.endpointId, input.event, input.outcome),
    onSuccess: () => invalidate('webhooks'),
    meta: { errorTitle: 'Could not send the test event' },
  })
}
