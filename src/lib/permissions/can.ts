import type { Action, DataScope, PermissionMatrix, PermissionSubject, Resource } from '@/types'
import { DEFAULT_PERMISSION_MATRIX } from './matrix'

/** Whether `user` may perform `action` on `resource`. Signed-out users can do nothing. */
export function can(
  user: PermissionSubject | null | undefined,
  resource: Resource,
  action: Action,
  matrix: PermissionMatrix = DEFAULT_PERMISSION_MATRIX,
): boolean {
  if (!user) return false
  return matrix[user.role][resource].actions.includes(action)
}

/**
 * Which records of `resource` the user may see. Returns `null` when the role has no access to
 * the resource at all, so callers cannot mistake "no access" for the narrowest scope.
 */
export function getDataScope(
  user: PermissionSubject | null | undefined,
  resource: Resource,
  matrix: PermissionMatrix = DEFAULT_PERMISSION_MATRIX,
): DataScope | null {
  if (!user) return null
  const access = matrix[user.role][resource]
  return access.actions.length > 0 ? access.scope : null
}
