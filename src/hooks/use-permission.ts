import { useCallback, useMemo } from 'react'
import { can, canAccessSection, getDataScope, hasFeature } from '@/lib/permissions'
import { useAuthStore } from '@/store/auth-store'
import type { Action, DataScope, FeaturePermission, Resource, Role, SettingsSection } from '@/types'
import { usePermissionMatrix } from './use-permission-matrix'

export interface UsePermission {
  role: Role | null
  can: (resource: Resource, action: Action) => boolean
  /** `null` when the current role has no access to the resource. */
  getScope: (resource: Resource) => DataScope | null
  canSection: (section: SettingsSection) => boolean
  /** Capabilities outside the matrix, such as view-spend. */
  feature: (permission: FeaturePermission) => boolean
}

/** Permission checks for the signed-in user, using the workspace matrix when it has loaded. */
export function usePermission(): UsePermission {
  const role = useAuthStore((state) => state.user?.role ?? null)
  const settings = usePermissionMatrix()
  const matrix = settings.data?.matrix
  const grants = settings.data?.sectionGrants
  const subject = useMemo(() => (role ? { role } : null), [role])

  const check = useCallback(
    (resource: Resource, action: Action) => can(subject, resource, action, matrix),
    [subject, matrix],
  )
  const getScope = useCallback(
    (resource: Resource) => getDataScope(subject, resource, matrix),
    [subject, matrix],
  )
  const canSection = useCallback(
    (section: SettingsSection) => canAccessSection(role, section, grants),
    [role, grants],
  )

  const feature = useCallback((permission: FeaturePermission) => hasFeature(subject, permission), [subject])

  return useMemo(
    () => ({ role, can: check, getScope, canSection, feature }),
    [role, check, getScope, canSection, feature],
  )
}
