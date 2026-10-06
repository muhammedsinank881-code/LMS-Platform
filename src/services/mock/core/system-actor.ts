import { ApiError } from '@/services/api/errors'
import type { User } from '@/types'
import { getMockNow } from '../config'
import { createRequestContext, type RequestContext } from './context'
import { getMockState } from './state'

/**
 * The context integrations and public forms act in: same workspace-bound database, but writes are
 * attributed to the system (`label`), never to the admin whose session built it. Permission checks
 * pass because the caller (a connected integration, a published form) already authorised the work.
 */
export function systemActorContext(ctx: RequestContext, label: string): RequestContext {
  const actor: User = {
    id: 'system:lead-capture',
    tenantId: ctx.tenantId,
    name: label,
    email: '',
    role: 'super_admin',
    teamId: null,
    language: 'English',
    location: '',
    workload: 0,
    status: 'active',
    phone: null,
    createdAt: ctx.timestamp,
  }
  return {
    ...ctx,
    actor,
    system: { label },
    can: () => true,
    hasFeature: () => true,
    requireFeature: () => undefined,
    require: () => undefined,
    scopeFor: () => 'all',
    inScope: () => true,
    assertInScope: () => undefined,
    requireWorkspaceAdmin: () => undefined,
  }
}

/** A system context for a workspace reached without a session, like a public form submission. */
export function publicWorkspaceContext(tenantId: string, label: string): RequestContext {
  const state = getMockState()
  const admin = state.tables.users.find(
    (user) => user.tenantId === tenantId && (user.role === 'admin' || user.role === 'super_admin'),
  )
  if (!admin) throw new ApiError('NOT_FOUND', 'This form is not available.')
  const session = {
    tenantId,
    user: {
      id: admin.id,
      tenantId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      teamId: admin.teamId,
      avatarUrl: null,
    },
  }
  return systemActorContext(createRequestContext(state, session, getMockNow()), label)
}
