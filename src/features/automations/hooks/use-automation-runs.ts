import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { AutomationRunListParams } from '@/types'

const REFRESH_MS = 15_000

/** Newest first. Refreshes quietly so waiting runs show their resume. */
export function useAutomationRuns(params?: AutomationRunListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.automations.runs(params),
    queryFn: () => api.automations.listRuns(params),
    enabled: ready,
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_MS,
  })
}

export function useAutomationRun(id: string | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.automations.run(id ?? ''),
    queryFn: () => api.automations.getRun(id ?? ''),
    enabled: ready && Boolean(id),
  })
}

const AFFECTED = ['automations', 'leads', 'followUps', 'tasks', 'notifications', 'auditLogs'] as const

export function useRetryRun() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.automations.retryRun(id),
    onSuccess: () => invalidate(...AFFECTED),
    meta: { errorTitle: 'Could not retry the run' },
  })
}

export function useCancelRun() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.automations.cancelRun(id),
    onSuccess: () => invalidate('automations'),
    meta: { errorTitle: 'Could not cancel the run' },
  })
}
