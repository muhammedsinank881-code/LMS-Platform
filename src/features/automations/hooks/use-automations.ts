import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { TestAutomationInput } from '@/services/api/automations'
import type { AutomationInput, AutomationListParams } from '@/types'

export function useAutomations(params?: AutomationListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.automations.list(params),
    queryFn: () => api.automations.list(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useAutomation(id: string | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.automations.detail(id ?? ''),
    queryFn: () => api.automations.get(id ?? ''),
    enabled: ready && Boolean(id),
  })
}

export function useAutomationTemplates() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.automations.templates,
    queryFn: () => api.automations.templates(),
    enabled: ready,
    staleTime: 60_000,
  })
}

export function useAutomationVersions(id: string | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.automations.versions(id ?? ''),
    queryFn: () => api.automations.versions(id ?? ''),
    enabled: ready && Boolean(id),
  })
}

export function useAutomationStats() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.automations.stats,
    queryFn: () => api.automations.stats(),
    enabled: ready,
  })
}

export function useCreateAutomation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: AutomationInput) => api.automations.create(input),
    onSuccess: () => invalidate('automations', 'auditLogs'),
    meta: { errorTitle: 'Could not create automation' },
  })
}

/** Saves a draft. A published automation is paused until it is published again. */
export function useUpdateAutomation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AutomationInput> }) =>
      api.automations.update(id, patch),
    onSuccess: () => invalidate('automations', 'auditLogs'),
    meta: { errorTitle: 'Could not save automation' },
  })
}

export function usePublishAutomation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: AutomationInput }) =>
      api.automations.publish(id, input),
    onSuccess: () => invalidate('automations', 'auditLogs'),
    meta: { errorTitle: 'Could not publish automation' },
  })
}

export function useDeleteAutomation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.automations.delete(id),
    onSuccess: () => invalidate('automations', 'auditLogs'),
    meta: { errorTitle: 'Could not delete automation' },
  })
}

export function useSetAutomationEnabled() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.automations.setEnabled(id, enabled),
    onSuccess: () => invalidate('automations', 'auditLogs'),
    meta: { errorTitle: 'Could not change automation' },
  })
}

export function useDuplicateAutomation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.automations.duplicate(id),
    onSuccess: () => invalidate('automations', 'auditLogs'),
    meta: { errorTitle: 'Could not duplicate automation' },
  })
}

export function useRestoreAutomationVersion() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      api.automations.restoreVersion(id, version),
    onSuccess: () => invalidate('automations', 'auditLogs'),
    meta: { errorTitle: 'Could not restore version' },
  })
}

export type BulkAutomationAction = 'enable' | 'disable' | 'delete'

/** Applies one action to many automations. Each is its own call, so each is audited. */
export function useBulkAutomations() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ ids, action }: { ids: string[]; action: BulkAutomationAction }) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          action === 'delete'
            ? api.automations.delete(id)
            : api.automations.setEnabled(id, action === 'enable'),
        ),
      )
      return { ok: results.filter((r) => r.status === 'fulfilled').length, failed: results.filter((r) => r.status === 'rejected').length }
    },
    onSuccess: () => invalidate('automations', 'auditLogs'),
    meta: { errorTitle: 'Bulk change failed' },
  })
}

/** Dry run: returns what would happen. Nothing is written, so nothing is invalidated. */
export function useTestAutomation() {
  return useMutation({
    mutationFn: (input: TestAutomationInput) => api.automations.test(input),
    meta: { errorTitle: 'Could not run the test' },
  })
}
