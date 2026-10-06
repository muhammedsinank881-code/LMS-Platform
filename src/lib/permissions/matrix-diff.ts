import type { AuditValue, PermissionMatrix, ResourceAccess, SectionGrants } from '@/types'
import { ACTIONS, RESOURCES, ROLES } from '@/types'
import { DEFAULT_PERMISSION_MATRIX } from './matrix'
import { defaultSectionGrants } from './sections'

export interface MatrixChange {
  key: string
  previous: string
  next: string
}

function sameAccess(left: ResourceAccess, right: ResourceAccess): boolean {
  if (left.scope !== right.scope || left.actions.length !== right.actions.length) return false
  return ACTIONS.every((action) => left.actions.includes(action) === right.actions.includes(action))
}

/** Cell-level diff used by the roles editor and the audit log. */
export function diffMatrix(before: PermissionMatrix, after: PermissionMatrix): MatrixChange[] {
  const changes: MatrixChange[] = []
  for (const role of ROLES) {
    for (const resource of RESOURCES) {
      const left = before[role][resource]
      const right = after[role][resource]
      if (sameAccess(left, right)) continue
      if (left.scope !== right.scope) {
        changes.push({
          key: `${role}.${resource}.scope`,
          previous: left.scope,
          next: right.scope,
        })
      }
      const leftActions = ACTIONS.filter((action) => left.actions.includes(action)).join(',')
      const rightActions = ACTIONS.filter((action) => right.actions.includes(action)).join(',')
      if (leftActions !== rightActions) {
        changes.push({
          key: `${role}.${resource}.actions`,
          previous: leftActions || 'none',
          next: rightActions || 'none',
        })
      }
    }
  }
  return changes
}

export function diffSectionGrants(before: SectionGrants, after: SectionGrants): MatrixChange[] {
  const changes: MatrixChange[] = []
  for (const role of ROLES) {
    for (const section of Object.keys(before[role]) as Array<keyof SectionGrants[typeof role]>) {
      if (before[role][section] === after[role][section]) continue
      changes.push({
        key: `${role}.${section}`,
        previous: String(before[role][section]),
        next: String(after[role][section]),
      })
    }
  }
  return changes
}

export function changesToAudit(
  changes: readonly MatrixChange[],
): { previousValue: AuditValue; newValue: AuditValue } | null {
  if (changes.length === 0) return null
  const previousValue: AuditValue = {}
  const newValue: AuditValue = {}
  for (const change of changes) {
    previousValue[change.key] = change.previous
    newValue[change.key] = change.next
  }
  return { previousValue, newValue }
}

function accessMatchesDefault(role: 'super_admin', matrix: PermissionMatrix): boolean {
  return RESOURCES.every((resource) =>
    sameAccess(matrix[role][resource], DEFAULT_PERMISSION_MATRIX[role][resource]),
  )
}

/** Super admin is locked to the product defaults. */
export function superAdminIsLocked(matrix: PermissionMatrix, grants: SectionGrants): boolean {
  const defaults = defaultSectionGrants().super_admin
  const grantUntouched = (Object.keys(defaults) as Array<keyof typeof defaults>).every(
    (section) => grants.super_admin[section] === defaults[section],
  )
  return accessMatchesDefault('super_admin', matrix) && grantUntouched
}
