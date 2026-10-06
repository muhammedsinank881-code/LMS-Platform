import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/services'
import { useAuthStore } from '@/store/auth-store'

/** Switches the active workspace and drops every cached query, since all data is tenant-scoped. */
export function useSwitchTenant() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (tenantId: string) => {
      const token = useAuthStore.getState().token
      if (!token) return Promise.reject(new Error('You are signed out.'))
      return authApi.switchTenant(token, tenantId)
    },
    onSuccess: (session) => {
      setSession(session)
      queryClient.clear()
    },
  })
}
