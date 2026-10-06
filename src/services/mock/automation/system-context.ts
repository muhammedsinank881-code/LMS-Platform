import type { Automation, ChainInfo, User } from '@/types'
import type { RequestContext } from '../core/context'

export const SYSTEM_ACTOR_PREFIX = 'automation:'

/**
 * The context an automation's actions run in: a system actor that is attributed as
 * "Automation: <name>" in activities and audit logs, with the permissions of the system (the
 * builder already checked that the creator may configure each action). Tenant scoping is
 * unchanged because `db` is still bound to the same workspace.
 */
export function systemContext(
  ctx: RequestContext,
  automation: Pick<Automation, 'id' | 'name'>,
  chain: ChainInfo,
): RequestContext {
  const actor: User = {
    id: `${SYSTEM_ACTOR_PREFIX}${automation.id}`,
    tenantId: ctx.tenantId,
    name: `Automation: ${automation.name}`,
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
    automation: { id: automation.id, name: automation.name, chain },
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
