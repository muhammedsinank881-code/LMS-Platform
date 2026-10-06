import { useQuery } from '@tanstack/react-query'
import { DEFAULT_PERMISSION_MATRIX, defaultSectionGrants } from '@/lib/permissions'
import { api } from '@/services'
import type { PermissionSettings } from '@/services/api/settings'
import { useWorkspace } from './use-workspace'

const FALLBACK: PermissionSettings = {
  matrix: DEFAULT_PERMISSION_MATRIX,
  sectionGrants: defaultSectionGrants(),
}

/** Tenant permission matrix. Falls back to the product defaults while it loads. */
export function usePermissionMatrix() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.config.permissions,
    queryFn: () => api.settings.permissions.get(),
    enabled: ready,
    staleTime: 60_000,
    placeholderData: FALLBACK,
  })
}
