import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { NotificationListParams } from '@/types'

export function useNotifications(params?: NotificationListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.notifications.list(params),
    queryFn: () => api.notifications.list(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

/** Read-state changes refetch both the list and the unread badge. */
function useReadStateMutation(run: (ids: string[]) => Promise<void>) {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  return useMutation({
    mutationFn: run,
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.notifications.all }),
    meta: { errorTitle: 'Could not update notifications' },
  })
}

export const useMarkNotificationsRead = () =>
  useReadStateMutation((ids) => api.notifications.markRead(ids))

export const useMarkNotificationsUnread = () =>
  useReadStateMutation((ids) => api.notifications.markUnread(ids))

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  return useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.notifications.all }),
    meta: { errorTitle: 'Could not update notifications' },
  })
}
