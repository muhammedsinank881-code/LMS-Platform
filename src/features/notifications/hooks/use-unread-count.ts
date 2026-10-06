import { useQuery } from '@tanstack/react-query'
import { useWorkspace } from '@/hooks/use-workspace'
import { notificationsApi } from '@/services'

export function useUnreadNotificationCount() {
  const { keys, ready, tenantId } = useWorkspace()
  return useQuery({
    queryKey: keys.notifications.unreadCount,
    queryFn: () => notificationsApi.getUnreadCount(tenantId ?? ''),
    enabled: ready,
    refetchInterval: () => (typeof document !== 'undefined' && document.hidden ? false : 30_000),
  })
}
