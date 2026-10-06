import { useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type {
  IncomingEmailInput,
  IncomingWhatsAppInput,
  MessageStatus,
  MissedCallInput,
  ResolveTemplateInput,
  EngagementInput,
  FormSubmissionInput,
} from '@/types'

function useSimMutation<TInput>(
  action: (input: TInput) => Promise<unknown>,
  errorTitle: string,
) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: action,
    onSuccess: () => invalidate('conversations', 'leads', 'notifications', 'callLogs', 'config'),
    meta: { errorTitle },
  })
}

export function useSimulateWhatsApp() {
  return useSimMutation(
    (input: IncomingWhatsAppInput) => api.simulator.incomingWhatsApp(input),
    'Could not simulate WhatsApp',
  )
}

export function useSimulateEmail() {
  return useSimMutation(
    (input: IncomingEmailInput) => api.simulator.incomingEmail(input),
    'Could not simulate email',
  )
}

export function useSimulateDelivery() {
  return useSimMutation(
    ({ messageId, status }: { messageId: string; status: MessageStatus }) =>
      api.simulator.setDeliveryStatus(messageId, status),
    'Could not change delivery status',
  )
}

export function useSimulateEmailOpen() {
  return useSimMutation((messageId: string) => api.simulator.emailOpened(messageId), 'Could not mark open')
}

export function useSimulateEmailClick() {
  return useSimMutation((messageId: string) => api.simulator.emailClicked(messageId), 'Could not mark click')
}

export function useSimulateMissedCall() {
  return useSimMutation((input: MissedCallInput) => api.simulator.missedCall(input), 'Could not simulate call')
}

export function useSimulateTemplateOutcome() {
  return useSimMutation(
    (input: ResolveTemplateInput) => api.simulator.resolveTemplate(input),
    'Could not resolve template',
  )
}

/** Recent sent messages for the delivery and tracking pickers. Refetches while the panel is open. */
export function useRecentOutbound() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: [...keys.conversations.all, 'simulator-recent'],
    queryFn: () => api.simulator.recentOutbound(),
    enabled: ready,
    refetchInterval: 3000,
  })
}

/** Engagement signals and form submissions re-score the lead and can trigger automations. */
export function useSimulateEngagement() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: EngagementInput) => api.simulator.engagement(input),
    onSuccess: () => invalidate('leads', 'automations', 'notifications', 'scoring'),
    meta: { errorTitle: 'Could not record the signal' },
  })
}

export function useSimulateFormSubmission() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: FormSubmissionInput) => api.simulator.submitForm(input),
    onSuccess: () => invalidate('leads', 'automations', 'notifications'),
    meta: { errorTitle: 'Could not submit the form' },
  })
}

export function useSimulatedClock() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: [...keys.automations.all, 'simulated-clock'],
    queryFn: () => api.simulator.getClock(),
    enabled: ready,
  })
}

/** Moving the clock resumes waiting runs and fires idle and overdue triggers, so most data can change. */
export function useAdvanceClock() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (minutes: number | null) => (minutes === null ? api.simulator.resetClock() : api.simulator.advanceClock(minutes)),
    onSuccess: () => invalidate('automations', 'leads', 'followUps', 'tasks', 'notifications', 'deals', 'auditLogs'),
    meta: { errorTitle: 'Could not move the clock' },
  })
}
