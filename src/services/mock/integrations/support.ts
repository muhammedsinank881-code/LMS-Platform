import {
  INTEGRATION_PROVIDERS,
  type Integration,
  type IntegrationEvent,
  type IntegrationEventType,
  type IntegrationProvider,
} from '@/types'
import type { RequestContext } from '../core/context'
import { notify } from '../core/records'
import { newId } from '../core/util'

const MAX_EVENTS = 50

export const integrationId = (provider: IntegrationProvider) => `int-${provider}`

export function emptyIntegration(provider: IntegrationProvider): Omit<Integration, 'tenantId'> {
  return {
    id: integrationId(provider),
    provider,
    status: 'not_connected',
    connectedBy: null,
    connectedAt: null,
    accountLabel: null,
    lastSyncAt: null,
    config: null,
    health: { checkedAt: null, ok: true, latencyMs: null, details: [] },
    error: null,
    leadsReceived: 0,
  }
}

/** One row per provider per workspace, created on first look so every card has something to show. */
export function ensureIntegrations(ctx: RequestContext): Integration[] {
  const have = new Set(ctx.db.all('integrations').map((row) => row.provider))
  for (const provider of INTEGRATION_PROVIDERS) {
    if (!have.has(provider)) ctx.db.insert('integrations', emptyIntegration(provider))
  }
  return INTEGRATION_PROVIDERS.map((provider) => ctx.db.get('integrations', integrationId(provider)))
}

/** Appends to the activity log and keeps only the latest 50 per integration. */
export function logEvent(
  ctx: RequestContext,
  integration: Pick<Integration, 'id'>,
  type: IntegrationEventType,
  message: string,
): IntegrationEvent {
  const event = ctx.db.insert('integrationEvents', {
    id: newId('intev'),
    integrationId: integration.id,
    type,
    message,
    at: ctx.timestamp,
  })
  const mine = ctx.db
    .all('integrationEvents')
    .filter((row) => row.integrationId === integration.id)
    .sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id))
  for (const stale of mine.slice(MAX_EVENTS)) ctx.db.remove('integrationEvents', stale.id)
  return event
}

/** Tells every admin in the workspace. Used for integration errors, expiry and paused webhooks. */
export function notifyAdmins(ctx: RequestContext, title: string, body: string, link: string): void {
  for (const user of ctx.db.all('users')) {
    if (user.role !== 'admin' && user.role !== 'super_admin') continue
    notify(ctx, user.id, { type: 'integration_alert', title, body, link }, { includeActor: true })
  }
}
