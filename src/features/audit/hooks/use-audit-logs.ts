import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { AuditLogListParams } from '@/types'

/** Only roles with the audit-log permission get data; everyone else receives FORBIDDEN. */
export function useAuditLogs(params?: AuditLogListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.auditLogs.list(params),
    queryFn: () => api.auditLogs.list(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useAuditLog(id: string | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.auditLogs.detail(id ?? ''),
    queryFn: () => api.auditLogs.get(id ?? ''),
    enabled: ready && Boolean(id),
  })
}

export function useExportAuditLogs() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (params?: AuditLogListParams) => api.auditLogs.export(params),
    onSuccess: () => invalidate('auditLogs'),
    meta: { errorTitle: 'Could not export the audit log' },
  })
}
