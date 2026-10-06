import type { TenantOwned } from './common'
import type { UserId } from './ids'

export const WEBHOOK_EVENTS = [
  'lead.created',
  'lead.updated',
  'lead.assigned',
  'lead.status_changed',
  'lead.converted',
  'deal.won',
  'deal.lost',
  'conversation.message_received',
] as const
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number]

/** Events a delivery can carry: the subscribable ones, plus an automation's direct call. */
export type WebhookDeliveryEvent = WebhookEvent | 'automation.called'

export interface WebhookFilter {
  /** Only deliver events for leads from these sources. Empty means all. */
  sourceIds: string[]
}

export interface WebhookHeader {
  name: string
  /** Masked: the value is write-only. */
  masked: string
}

export const WEBHOOK_STATUSES = ['active', 'failing', 'paused'] as const
export type WebhookStatus = (typeof WEBHOOK_STATUSES)[number]

export interface WebhookEndpoint extends TenantOwned {
  id: string
  url: string
  description: string
  events: WebhookEvent[]
  enabled: boolean
  secretLast4: string
  headers: WebhookHeader[]
  filter: WebhookFilter | null
  status: WebhookStatus
  pausedReason: string | null
  consecutiveFailures: number
  createdBy: UserId
  createdAt: string
  lastDeliveryAt: string | null
  lastDeliveryStatus: 'success' | 'failed' | null
}

export interface WebhookHeaderInput {
  name: string
  /** Omit on edit to keep the stored value. */
  value?: string
}

export interface WebhookInput {
  url: string
  description: string
  events: WebhookEvent[]
  enabled: boolean
  headers: WebhookHeaderInput[]
  filter: WebhookFilter | null
}

export interface WebhookEndpointCreated {
  endpoint: WebhookEndpoint
  secret: string
}

export const WEBHOOK_OUTCOMES = ['success', 'http_500', 'timeout'] as const
export type WebhookOutcome = (typeof WEBHOOK_OUTCOMES)[number]

export const DELIVERY_STATUSES = ['success', 'retrying', 'failed'] as const
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number]

export interface WebhookDelivery extends TenantOwned {
  id: string
  endpointId: string
  /** Groups the attempts of one event. */
  eventId: string
  event: WebhookDeliveryEvent
  at: string
  status: DeliveryStatus
  httpStatus: number | null
  durationMs: number
  attempt: number
  nextRetryAt: string | null
  /** Redacted JSON of what was sent. */
  requestBody: string
  requestHeaders: Record<string, string>
  responseBody: string
  test: boolean
}

export interface WebhookHealth {
  total: number
  successRate: number | null
  failing: boolean
}

export interface WebhookEndpointView extends WebhookEndpoint {
  health: WebhookHealth
}

/** The delay before each retry: 1 minute, 5 minutes, then 30 minutes. */
export const WEBHOOK_RETRY_DELAYS_MIN = [1, 5, 30] as const
/** Consecutive failed attempts that pause an endpoint. */
export const WEBHOOK_PAUSE_AFTER = 5
