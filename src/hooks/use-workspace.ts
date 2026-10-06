import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createQueryKeys, type QueryKeys, type ResourceName } from '@/lib/queryKeys'
import { useAuthStore } from '@/store/auth-store'

export interface UseWorkspace {
  /** Query keys bound to the signed-in user and workspace. */
  keys: QueryKeys
  /** False while signed out; queries pass it as `enabled` so nothing fires without a session. */
  ready: boolean
  tenantId: string | null
}

/** The tenant-aware cache scope for the current session. */
export function useWorkspace(): UseWorkspace {
  const tenantId = useAuthStore((state) => state.tenant?.id ?? null)
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const role = useAuthStore((state) => state.user?.role ?? null)
  const ready = tenantId !== null && userId !== null && role !== null

  return useMemo(
    () => ({
      keys: createQueryKeys({ tenantId: tenantId ?? '', userId: userId ?? '', role: role ?? '' }),
      ready,
      tenantId,
    }),
    [tenantId, userId, role, ready],
  )
}

/** Marks whole resources stale, e.g. `invalidate('leads', 'reports')` after a lead changes. */
export function useInvalidate(): (...resources: ResourceName[]) => Promise<void> {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()

  return useCallback(
    async (...resources) => {
      await Promise.all(
        resources.map((resource) => queryClient.invalidateQueries({ queryKey: keys[resource].all })),
      )
    },
    [queryClient, keys],
  )
}
