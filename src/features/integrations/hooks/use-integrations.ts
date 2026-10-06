import { useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { ConnectIntegrationInput, IntegrationProvider, UpdateIntegrationInput } from '@/types'

export function useIntegrations() {
  const { keys, ready } = useWorkspace()
  return useQuery({ queryKey: keys.integrations.list, queryFn: () => api.integrations.list(), enabled: ready })
}

export function useIntegrationEvents(provider: IntegrationProvider, enabled = true) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.integrations.events(provider),
    queryFn: () => api.integrations.events(provider),
    enabled: ready && enabled,
  })
}

/** Connect and credential updates carry a secret, so their mutation state is dropped at once (`gcTime: 0`). */
export function useConnectIntegration() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: ConnectIntegrationInput) => api.integrations.connect(input),
    onSuccess: () => invalidate('integrations', 'auditLogs'),
    gcTime: 0,
    meta: { errorTitle: 'Could not connect' },
  })
}

export function useUpdateIntegration(provider: IntegrationProvider) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: UpdateIntegrationInput) => api.integrations.update(provider, input),
    onSuccess: () => invalidate('integrations', 'auditLogs'),
    gcTime: 0,
    meta: { errorTitle: 'Could not save settings' },
  })
}

function useProviderAction<T>(action: (provider: IntegrationProvider) => Promise<T>, errorTitle: string, also: Parameters<ReturnType<typeof useInvalidate>> = []) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: action,
    onSuccess: () => invalidate('integrations', 'auditLogs', ...also),
    meta: { errorTitle },
  })
}

export const useBeginConnect = () => useProviderAction((provider) => api.integrations.begin(provider), 'Could not start connecting')
export const useReconnect = () => useProviderAction((provider) => api.integrations.reconnect(provider), 'Could not reconnect', ['notifications'])
export const useDisconnect = () => useProviderAction((provider) => api.integrations.disconnect(provider), 'Could not disconnect')

function useAction<TInput, TResult>(action: (input: TInput) => Promise<TResult>, errorTitle: string, also: Parameters<ReturnType<typeof useInvalidate>> = []) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: action,
    onSuccess: () => invalidate('integrations', ...also),
    meta: { errorTitle },
  })
}

export const useVerifyWebhook = () => useAction(() => api.integrations.verifyWebhook(), 'Webhook check failed')
export const useSyncTemplates = () => useAction(() => api.integrations.syncTemplates(), 'Could not sync templates', ['config'])
export const useSendTestEmail = () => useAction((to: string) => api.integrations.sendTestEmail(to), 'Could not send the test email')
export const useTestCall = () => useAction(() => api.integrations.testCall(), 'Could not log the test call', ['callLogs'])
export const useSyncSpend = () => useAction(() => api.integrations.syncSpend(), 'Could not sync spend', ['spend', 'campaigns'])
export const useSendTestLead = () =>
  useAction(
    (input: { provider: IntegrationProvider; formId?: string }) => api.integrations.sendTestLead(input.provider, input.formId),
    'Could not send the test lead',
    ['leads', 'notifications', 'reports'],
  )
