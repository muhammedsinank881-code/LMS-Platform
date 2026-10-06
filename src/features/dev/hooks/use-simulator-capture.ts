import { useMutation } from '@tanstack/react-query'
import { useInvalidate } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { IntegrationProvider, LeadAdsProvider, Utm, WebhookOutcome } from '@/types'

function useCaptureSim<TInput, TResult>(action: (input: TInput) => Promise<TResult>, errorTitle: string) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: action,
    onSuccess: () => invalidate('leads', 'leadForms', 'integrations', 'webhooks', 'notifications', 'conversations', 'spend', 'campaigns', 'auditLogs'),
    meta: { errorTitle },
  })
}

export const useSimulateAdLead = () => useCaptureSim((provider: LeadAdsProvider) => api.simulator.adLead(provider), 'Could not send the lead')
export const useSimulateFormSubmission = () =>
  useCaptureSim((input: { formId: string; utm: Utm }) => api.simulator.captureFormSubmission(input.formId, input.utm), 'Could not submit the form')
export const useSimulateWhatsAppLead = () =>
  useCaptureSim((input: { phone: string; text: string }) => api.simulator.whatsappLead(input.phone, input.text), 'Could not simulate the WhatsApp lead')
export const useSetWebhookOutcome = () => useCaptureSim((outcome: WebhookOutcome) => api.simulator.setWebhookOutcome(outcome), 'Could not set the outcome')
export const useFailIntegration = () =>
  useCaptureSim((input: { provider: IntegrationProvider; kind: 'error' | 'expired' }) => api.simulator.failIntegration(input.provider, input.kind), 'Could not break the integration')
export const useSimulateSpendSync = () => useCaptureSim(() => api.simulator.syncSpend(), 'Could not sync spend')
