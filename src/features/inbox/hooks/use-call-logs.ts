import { useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { CallLogListParams, CreateCallLogInput } from '@/types'

export function useCallLogs(params?: CallLogListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.callLogs.list(params),
    queryFn: () => api.callLogs.list(params),
    enabled: ready,
  })
}

export function useCreateCallLog() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: CreateCallLogInput) => api.callLogs.create(input),
    onSuccess: () => invalidate('callLogs', 'conversations', 'leads'),
    meta: { errorTitle: 'Could not log call' },
  })
}

export function useUpdateCallNotes() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => api.callLogs.updateNotes(id, notes),
    onSuccess: () => invalidate('callLogs'),
    meta: { errorTitle: 'Could not update notes' },
  })
}
