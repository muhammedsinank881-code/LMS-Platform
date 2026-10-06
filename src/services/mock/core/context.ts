import { can as roleCan, DEFAULT_PERMISSION_MATRIX, getDataScope, hasFeature } from '@/lib/permissions'
import { ApiError } from '@/services/api/errors'
import type { Action, ChainInfo, DataScope, FeaturePermission, Resource, User } from '@/types'
import { getMockNow } from '../config'
import { simulateNetwork } from '../latency'
import { getMockSession, type MockSession } from '../session'
import { createFaker, DEFAULT_SEED, seedEmptyTenant } from '../seed'
import { getMockState } from './state'
import { createTenantDb, type MockState, type TenantDb } from './store'
import { clone } from './util'

/** Set on the derived context an automation's actions run in. */
export interface AutomationActor {
  id: string
  name: string
  /** The chain the triggering event belongs to; events the actions emit extend it. */
  chain: ChainInfo
}

/** Everything a resource handler may touch, already bound to one workspace and one user. */
export interface RequestContext {
  tenantId: string
  /** Tenant-scoped view of the database: other workspaces' rows are unreachable through it. */
  db: TenantDb
  /** The acting user: their domain record, acting with the role of the current session. */
  actor: User
  now: Date
  /** `now` as an ISO timestamp, for `createdAt`/`updatedAt`. */
  timestamp: string
  can(resource: Resource, action: Action): boolean
  /** Capabilities outside the matrix, such as view-spend. */
  hasFeature(feature: FeaturePermission): boolean
  /** Throws FORBIDDEN unless the role holds the feature permission. */
  requireFeature(feature: FeaturePermission): void
  /** Throws FORBIDDEN unless the role may perform `action` on `resource`. */
  require(resource: Resource, action: Action): void
  /** How much of `resource` the role can see. Throws FORBIDDEN when it has no access at all. */
  scopeFor(resource: Resource): DataScope
  /** Whether a record owned by any of `ownerIds` falls in the role's data scope. */
  inScope(resource: Resource, ...ownerIds: Array<string | null | undefined>): boolean
  /** Throws FORBIDDEN when the record is outside the role's data scope. */
  assertInScope(resource: Resource, ...ownerIds: Array<string | null | undefined>): void
  teamOf(userId: string): string | null
  /** Workspace configuration (statuses, rules, ...) may only be changed by workspace admins. */
  requireWorkspaceAdmin(): void
  /** Present when the work is done by an automation (as a system actor), not a person. */
  automation?: AutomationActor
  /** Set when an integration or public form acts: attributed to the system, not to a person. */
  system?: { label: string }
  /** A dry run on a throwaway copy of the data: no events are emitted. */
  dryRun?: boolean
}

let requestHook: ((ctx: RequestContext) => void) | null = null

/** Runs before every handler, like a worker waking up. The automation scheduler registers here. */
export function setRequestHook(hook: ((ctx: RequestContext) => void) | null): void {
  requestHook = hook
}

const forbidden = (message: string) => new ApiError('FORBIDDEN', message)

/** Makes sure the workspace and the acting user exist, e.g. for a freshly registered tenant. */
function ensureWorkspace(state: MockState, session: MockSession, now: Date): void {
  const { tenantId, user } = session
  const known = state.tables.tenantSettings.some((row) => row.tenantId === tenantId)
  if (!known) {
    const env = {
      faker: createFaker(DEFAULT_SEED),
      now,
      tenantId,
      key: tenantId.replace(/[^a-z0-9]/gi, '').slice(0, 10) || 'ws',
      scale: 0,
    }
    seedEmptyTenant(state, env, user)
    return
  }
  const present = state.tables.users.some((u) => u.tenantId === tenantId && u.id === user.id)
  if (!present) {
    state.tables.users.push({
      id: user.id,
      tenantId,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
      avatarUrl: user.avatarUrl ?? null,
      language: 'English',
      location: '',
      workload: 0,
      status: 'active',
      phone: null,
      createdAt: now.toISOString(),
    })
  }
}

export function createRequestContext(
  state: MockState,
  session: MockSession,
  now: Date,
): RequestContext {
  ensureWorkspace(state, session, now)
  const db = createTenantDb(state, session.tenantId)
  const record = db.get('users', session.user.id, 'User')
  // The dev role switcher changes the session's role; team membership stays with the record.
  const actor: User = { ...record, role: session.user.role }

  const teamOf = (userId: string) => db.find('users', userId)?.teamId ?? null
  const matrix = db.find('tenantSettings', session.tenantId)?.permissions ?? DEFAULT_PERMISSION_MATRIX

  function visibleOwners(scope: DataScope): Set<string> | null {
    if (scope === 'all') return null
    if (scope === 'own' || !actor.teamId) return new Set([actor.id])
    return new Set(
      db
        .all('users')
        .filter((u) => u.teamId === actor.teamId)
        .map((u) => u.id),
    )
  }

  function scopeFor(resource: Resource): DataScope {
    const scope = getDataScope(actor, resource, matrix)
    if (!scope) throw forbidden(`Your role cannot access ${resource.replace('_', ' ')}.`)
    return scope
  }

  function inScope(resource: Resource, ...ownerIds: Array<string | null | undefined>): boolean {
    const owners = visibleOwners(scopeFor(resource))
    if (owners === null) return true
    return ownerIds.some((id) => id != null && owners.has(id))
  }

  return {
    tenantId: session.tenantId,
    db,
    actor,
    now,
    timestamp: now.toISOString(),
    can: (resource, action) => roleCan(actor, resource, action, matrix),
    hasFeature: (feature) => hasFeature(actor, feature),
    requireFeature(feature) {
      if (!hasFeature(actor, feature)) throw forbidden('Your role does not have access to this.')
    },
    require(resource, action) {
      if (!roleCan(actor, resource, action, matrix)) {
        throw forbidden(`Your role cannot ${action} ${resource.replace('_', ' ')}.`)
      }
    },
    scopeFor,
    inScope,
    assertInScope(resource, ...ownerIds) {
      if (!inScope(resource, ...ownerIds)) {
        throw forbidden('That record belongs to someone outside your access.')
      }
    },
    teamOf,
    requireWorkspaceAdmin() {
      if (!roleCan(actor, 'settings', 'edit', matrix) || getDataScope(actor, 'settings', matrix) !== 'all') {
        throw forbidden('Only workspace admins can change these settings.')
      }
    },
  }
}

/**
 * Runs a handler the way a request hits a server: the caller is identified when the request is
 * made, the network takes a moment, and the response is a copy no one can use to edit the
 * database. Every mock endpoint goes through here.
 */
export async function request<T>(handler: (ctx: RequestContext) => T | Promise<T>): Promise<T> {
  const session = getMockSession()
  await simulateNetwork()
  const ctx = createRequestContext(getMockState(), session, getMockNow())
  requestHook?.(ctx)
  return clone(await handler(ctx))
}
