import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { CreateNotificationInput } from '@/types'

export function useCreateNotification() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  return useMutation({
    mutationFn: (input: CreateNotificationInput) => api.notifications.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.notifications.all }),
  })
}
