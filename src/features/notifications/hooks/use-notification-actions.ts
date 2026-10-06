import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { NotificationPreferences } from '@/types'

export function useNotificationPreferences() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.notificationPreferences.current,
    queryFn: () => api.notifications.getPreferences(),
    enabled: ready,
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  return useMutation({
    mutationFn: (input: NotificationPreferences) => api.notifications.updatePreferences(input),
    onSuccess: (data) => queryClient.setQueryData(keys.notificationPreferences.current, data),
    meta: { errorTitle: 'Could not save notification preferences' },
  })
}

export function useDeleteNotifications() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  return useMutation({
    mutationFn: (ids: string[]) => api.notifications.delete(ids),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.notifications.all }),
    meta: { errorTitle: 'Could not delete notifications' },
  })
}
