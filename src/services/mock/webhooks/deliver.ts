import { retryDelayMs, shouldAutoPause } from '@/lib/webhooks/dispatch'
import { redactHeaders, redactText } from '@/lib/webhooks/redact'
import { EVENT_HEADER, SIGNATURE_HEADER, signPayload } from '@/lib/webhooks/signature'
import type { WebhookDelivery, WebhookDeliveryEvent, WebhookEndpoint, WebhookOutcome } from '@/types'
import type { RequestContext } from '../core/context'
import { getMockState } from '../core/state'
import { newId } from '../core/util'
import { notifyAdmins } from '../integrations/support'

const FAILING_AFTER = 3

export const getVaultSecret = (endpointId: string): string => getMockState().vault?.[endpointId] ?? ''

export function setVaultSecret(endpointId: string, secret: string): void {
  const state = getMockState()
  state.vault = { ...state.vault, [endpointId]: secret }
}

export const defaultOutcome = (): WebhookOutcome => getMockState().webhookOutcome ?? 'success'

interface SimulatedResponse {
  httpStatus: number | null
  durationMs: number
  body: string
}

/** What the customer's server would answer. Duration is stable per event, so logs look the same on reruns. */
function simulate(outcome: WebhookOutcome, seed: string): SimulatedResponse {
  const jitter = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 180
  if (outcome === 'http_500') return { httpStatus: 500, durationMs: 90 + jitter, body: '{"error":"Internal Server Error"}' }
  if (outcome === 'timeout') return { httpStatus: null, durationMs: 10_000, body: 'Request timed out after 10 seconds.' }
  return { httpStatus: 200, durationMs: 80 + jitter, body: '{"received":true}' }
}

export interface AttemptInput {
  eventId: string
  event: WebhookDeliveryEvent
  body: string
  attempt: number
  test?: boolean
  outcome?: WebhookOutcome
}

function updateEndpointHealth(ctx: RequestContext, endpoint: WebhookEndpoint, delivery: WebhookDelivery, test: boolean): void {
  if (test) {
    ctx.db.save('webhooks', { ...endpoint, lastDeliveryAt: delivery.at, lastDeliveryStatus: delivery.httpStatus && delivery.httpStatus < 300 ? 'success' : 'failed' })
    return
  }
  const ok = delivery.httpStatus !== null && delivery.httpStatus < 300
  const failures = ok ? 0 : endpoint.consecutiveFailures + 1
  const pause = shouldAutoPause(failures)
  const status = pause ? 'paused' : failures >= FAILING_AFTER ? 'failing' : 'active'
  ctx.db.save('webhooks', {
    ...endpoint,
    consecutiveFailures: failures,
    status,
    pausedReason: pause ? `Paused automatically after ${failures} failed deliveries in a row.` : status === 'paused' ? endpoint.pausedReason : null,
    lastDeliveryAt: delivery.at,
    lastDeliveryStatus: ok ? 'success' : 'failed',
  })
  if (pause && endpoint.status !== 'paused') {
    notifyAdmins(ctx, 'Webhook paused', `${endpoint.url} failed ${failures} times in a row and was paused.`, '/settings/api-keys?tab=webhooks')
  }
}

/** Performs one simulated delivery attempt: signs the body, records the result, schedules a retry. */
export function performAttempt(ctx: RequestContext, endpoint: WebhookEndpoint, input: AttemptInput): WebhookDelivery {
  const timestamp = Math.floor(ctx.now.getTime() / 1000)
  const signature = signPayload(getVaultSecret(endpoint.id), input.body, timestamp)
  const result = simulate(input.outcome ?? defaultOutcome(), `${input.eventId}:${input.attempt}`)
  const ok = result.httpStatus !== null && result.httpStatus < 300
  const delay = ok || input.test ? null : retryDelayMs(input.attempt)
  const status = ok ? 'success' : delay !== null ? 'retrying' : 'failed'

  const delivery = ctx.db.insert('webhookDeliveries', {
    id: newId('whd'),
    endpointId: endpoint.id,
    eventId: input.eventId,
    event: input.event,
    at: ctx.timestamp,
    status,
    httpStatus: result.httpStatus,
    durationMs: result.durationMs,
    attempt: input.attempt,
    nextRetryAt: delay === null ? null : new Date(ctx.now.getTime() + delay).toISOString(),
    requestBody: redactText(input.body),
    requestHeaders: redactHeaders({
      'Content-Type': 'application/json',
      [EVENT_HEADER]: input.event,
      [SIGNATURE_HEADER]: signature,
      ...Object.fromEntries(endpoint.headers.map((header) => [header.name, header.masked])),
    }),
    responseBody: result.body,
    test: input.test ?? false,
  })
  updateEndpointHealth(ctx, endpoint, delivery, input.test ?? false)
  return delivery
}

/** Runs retries that have come due. Called before every request, like a worker polling a queue. */
export function processWebhookRetries(ctx: RequestContext): void {
  const due = ctx.db
    .all('webhookDeliveries')
    .filter((row) => row.status === 'retrying' && row.nextRetryAt !== null && row.nextRetryAt <= ctx.timestamp)
    .sort((a, b) => a.nextRetryAt!.localeCompare(b.nextRetryAt!))
  for (const previous of due) {
    ctx.db.save('webhookDeliveries', { ...previous, status: 'failed', nextRetryAt: null })
    const endpoint = ctx.db.find('webhooks', previous.endpointId)
    if (!endpoint || !endpoint.enabled || endpoint.status === 'paused') continue
    performAttempt(ctx, endpoint, {
      eventId: previous.eventId,
      event: previous.event,
      body: previous.requestBody,
      attempt: previous.attempt + 1,
    })
  }
}
