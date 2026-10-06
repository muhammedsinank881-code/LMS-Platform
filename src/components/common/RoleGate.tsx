import type { ReactNode } from 'react'
import { usePermission } from '@/hooks/use-permission'
import type { Action, Resource } from '@/types'

export interface RoleGateProps {
  resource: Resource
  /** Defaults to `view`. */
  action?: Action
  /** Rendered when the user lacks permission. Defaults to nothing (hide). */
  fallback?: ReactNode
  children: ReactNode
}

/** Renders `children` only if the current user may perform `action` on `resource`. */
export function RoleGate({ resource, action = 'view', fallback = null, children }: RoleGateProps) {
  const { can } = usePermission()
  return <>{can(resource, action) ? children : fallback}</>
}
