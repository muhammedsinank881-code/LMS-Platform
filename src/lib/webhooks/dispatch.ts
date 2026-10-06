import {
  WEBHOOK_PAUSE_AFTER,
  WEBHOOK_RETRY_DELAYS_MIN,
  type WebhookEndpoint,
  type WebhookEvent,
} from '@/types'

const EVENT_MAP: Partial<Record<string, WebhookEvent>> = {
  lead_converted: 'lead.converted',
  lead_created: 'lead.created',
  lead_updated: 'lead.updated',
  lead_assigned: 'lead.assigned',
  status_changed: 'lead.status_changed',
  deal_won: 'deal.won',
  deal_lost: 'deal.lost',
  message_received: 'conversation.message_received',
}

/** The webhook event an internal bus event becomes, or null when it is not public. */
export function toWebhookEvent(type: string): WebhookEvent | null {
  return EVENT_MAP[type] ?? null
}

export interface MatchContext {
  tenantId: string
  /** Source of the lead the event is about, when there is one. */
  sourceId: string | null
}

/** The endpoints that should receive `event`: same workspace, on, not paused, subscribed, passing the filter. */
export function matchEndpoints(
  event: WebhookEvent,
  context: MatchContext,
  endpoints: readonly WebhookEndpoint[],
): WebhookEndpoint[] {
  return endpoints.filter((endpoint) => {
    if (endpoint.tenantId !== context.tenantId) return false
    if (!endpoint.enabled || endpoint.status === 'paused') return false
    if (!endpoint.events.includes(event)) return false
    const sources = endpoint.filter?.sourceIds ?? []
    if (sources.length === 0) return true
    return context.sourceId !== null && sources.includes(context.sourceId)
  })
}

/** Delay before the retry that follows failed attempt number `attempt` (1-based), or null when out of retries. */
export function retryDelayMs(attempt: number): number | null {
  const minutes = WEBHOOK_RETRY_DELAYS_MIN[attempt - 1]
  return minutes === undefined ? null : minutes * 60_000
}

export const shouldAutoPause = (consecutiveFailures: number) => consecutiveFailures >= WEBHOOK_PAUSE_AFTER
