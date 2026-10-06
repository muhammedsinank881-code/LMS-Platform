import { useEffect, useRef } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'

/**
 * Drops every cached query and mutation when the session identity changes: logout, signing in as
 * someone else, switching workspace or switching role. Keys are already scoped to
 * tenant/user/role, so this is the second line of defence, and it frees the memory.
 */
export function useResetCacheOnSessionChange(queryClient: QueryClient): void {
  const token = useAuthStore((state) => state.token)
  const tenantId = useAuthStore((state) => state.tenant?.id ?? null)
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const role = useAuthStore((state) => state.user?.role ?? null)
  const identity = `${token ?? ''}|${tenantId ?? ''}|${userId ?? ''}|${role ?? ''}`
  const previous = useRef(identity)

  useEffect(() => {
    if (previous.current === identity) return
    previous.current = identity
    void queryClient.cancelQueries()
    queryClient.clear()
  }, [identity, queryClient])
}
