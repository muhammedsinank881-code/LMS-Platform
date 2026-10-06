import { matchEndpoints, toWebhookEvent } from '@/lib/webhooks/dispatch'
import { buildEnvelope, leadData } from '@/lib/webhooks/payload'
import type { DomainEvent, Lead, WebhookEndpoint, WebhookEvent } from '@/types'
import { setRequestHook, type RequestContext } from '../core/context'
import { tickAutomations } from '../automation/scheduler'
import { subscribe } from '../automation/event-bus'
import { performAttempt, processWebhookRetries } from './deliver'

function leadFor(ctx: RequestContext, event: DomainEvent): Lead | undefined {
  if (event.entity.kind === 'lead') return ctx.db.find('leads', event.entity.id)
  if (event.entity.kind === 'deal') {
    const deal = ctx.db.find('deals', event.entity.id)
    return deal ? ctx.db.find('leads', deal.leadId) : undefined
  }
  return undefined
}

/** The lead as an endpoint receives it, with source and status as names. */
export function leadSnapshot(ctx: RequestContext, lead: Lead): Record<string, unknown> {
  return leadData(lead, {
    sourceName: (id) => ctx.db.find('leadSources', id)?.name ?? id,
    statusName: (id) => ctx.db.find('leadStatuses', id)?.name ?? id,
  })
}

/** The JSON `data` of an event: the lead (or deal) plus what the event itself carries. */
export function eventData(ctx: RequestContext, event: DomainEvent, lead: Lead | undefined): Record<string, unknown> {
  const data: Record<string, unknown> = lead ? { lead: leadSnapshot(ctx, lead) } : {}
  if (event.entity.kind === 'deal') {
    const deal = ctx.db.find('deals', event.entity.id)
    if (deal) data.deal = { id: deal.id, value: deal.value, leadId: deal.leadId }
  }
  const { fromStatusId, toStatusId, toUserId, channel, changedFields } = event.data
  if (fromStatusId !== undefined) data.fromStatusId = fromStatusId
  if (toStatusId !== undefined) data.toStatusId = toStatusId
  if (toUserId !== undefined) data.toUserId = toUserId
  if (channel) data.channel = channel
  if (changedFields) data.changedFields = changedFields
  return data
}

/** Queues and attempts a delivery for every endpoint of the workspace that wants this event. */
export function dispatchDomainEvent(ctx: RequestContext, event: DomainEvent): void {
  const type: WebhookEvent | null = toWebhookEvent(event.type)
  if (!type) return
  const lead = leadFor(ctx, event)
  const endpoints = matchEndpoints(type, { tenantId: ctx.tenantId, sourceId: lead?.sourceId ?? null }, ctx.db.all('webhooks'))
  if (endpoints.length === 0) return
  const body = JSON.stringify(buildEnvelope(event.id, type, event.occurredAt, eventData(ctx, event, lead)))
  for (const endpoint of endpoints) deliverTo(ctx, endpoint, { eventId: event.id, event: type, body })
}

function deliverTo(ctx: RequestContext, endpoint: WebhookEndpoint, input: { eventId: string; event: WebhookEvent; body: string }) {
  return performAttempt(ctx, endpoint, { ...input, attempt: 1 })
}

let registered = false

/** Feeds the shared event bus into the webhook dispatcher and polls the retry queue on each request. */
export function registerWebhookDispatcher(): void {
  if (registered) return
  registered = true
  subscribe(dispatchDomainEvent)
  setRequestHook((ctx) => {
    tickAutomations(ctx)
    processWebhookRetries(ctx)
  })
}
