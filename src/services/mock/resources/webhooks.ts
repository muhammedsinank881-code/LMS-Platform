import { maskSecret } from '@/lib/webhooks/redact'
import { samplePayload } from '@/lib/webhooks/payload'
import type { WebhooksApiClient } from '@/services/api/webhooks'
import {
  webhookSchema,
  type WebhookEndpoint,
  type WebhookEndpointView,
  type WebhookHeader,
  type WebhookInput,
} from '@/types'
import { request, type RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { requireSection } from '../core/section'
import { randomToken } from '../core/secrets'
import { newId } from '../core/util'
import { parseInput, validationError } from '../core/validate'
import { getMockState } from '../core/state'
import { performAttempt, setVaultSecret } from '../webhooks/deliver'

const guard = (ctx: RequestContext) => requireSection(ctx, 'api_keys')
const HEALTH_WINDOW = 20

function audit(ctx: RequestContext, endpoint: WebhookEndpoint, action: 'created' | 'updated' | 'deleted', note: string): void {
  recordAudit(ctx, {
    action,
    entity: 'webhook',
    entityId: endpoint.id,
    entityLabel: endpoint.description || endpoint.url,
    // Header names and event names only: values and the signing secret never reach the log.
    newValue: { event: note, url: endpoint.url, events: endpoint.events, headers: endpoint.headers.map((header) => header.name) },
  })
}

function buildHeaders(input: WebhookInput, existing: WebhookHeader[]): WebhookHeader[] {
  return input.headers.map((header) => {
    if (header.value) return { name: header.name, masked: maskSecret(header.value) }
    const kept = existing.find((item) => item.name.toLowerCase() === header.name.toLowerCase())
    if (!kept) throw validationError('headers', `Add a value for the ${header.name} header.`)
    return kept
  })
}

function view(ctx: RequestContext, endpoint: WebhookEndpoint): WebhookEndpointView {
  const recent = ctx.db
    .all('webhookDeliveries')
    .filter((row) => row.endpointId === endpoint.id && !row.test)
    .sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id))
    .slice(0, HEALTH_WINDOW)
  const ok = recent.filter((row) => row.status === 'success').length
  return {
    ...endpoint,
    health: {
      total: recent.length,
      successRate: recent.length === 0 ? null : Math.round((ok / recent.length) * 100),
      failing: endpoint.status !== 'active',
    },
  }
}

function mint(ctx: RequestContext, id: string): string {
  void ctx
  const secret = `whsec_${randomToken(32)}`
  setVaultSecret(id, secret)
  return secret
}

export const mockWebhooksApi: WebhooksApiClient = {
  list: () =>
    request((ctx) => {
      guard(ctx)
      return [...ctx.db.all('webhooks')].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((endpoint) => view(ctx, endpoint))
    }),
  options: () =>
    request((ctx) => {
      ctx.require('automations', 'edit')
      return ctx.db
        .all('webhooks')
        .filter((endpoint) => endpoint.enabled && endpoint.status !== 'paused')
        .map((endpoint) => ({ id: endpoint.id, label: endpoint.description || endpoint.url }))
    }),
  create: (input) =>
    request((ctx) => {
      guard(ctx)
      const parsed = parseInput(webhookSchema, input)
      const id = newId('wh')
      const secret = mint(ctx, id)
      const endpoint = ctx.db.insert('webhooks', {
        id,
        url: parsed.url,
        description: parsed.description,
        events: parsed.events,
        enabled: parsed.enabled,
        secretLast4: secret.slice(-4),
        headers: buildHeaders(parsed, []),
        filter: parsed.filter && parsed.filter.sourceIds.length > 0 ? parsed.filter : null,
        status: 'active',
        pausedReason: null,
        consecutiveFailures: 0,
        createdBy: ctx.actor.id,
        createdAt: ctx.timestamp,
        lastDeliveryAt: null,
        lastDeliveryStatus: null,
      })
      audit(ctx, endpoint, 'created', 'created')
      return { endpoint, secret }
    }),
  update: (id, input) =>
    request((ctx) => {
      guard(ctx)
      const parsed = parseInput(webhookSchema, input)
      const current = ctx.db.get('webhooks', id, 'Webhook')
      const resume = parsed.enabled && current.status === 'paused'
      const saved = ctx.db.save('webhooks', {
        ...current,
        url: parsed.url,
        description: parsed.description,
        events: parsed.events,
        enabled: parsed.enabled,
        headers: buildHeaders(parsed, current.headers),
        filter: parsed.filter && parsed.filter.sourceIds.length > 0 ? parsed.filter : null,
        ...(resume && { status: 'active' as const, consecutiveFailures: 0, pausedReason: null }),
      })
      audit(ctx, saved, 'updated', resume ? 'updated and resumed' : 'updated')
      return saved
    }),
  remove: (id) =>
    request((ctx) => {
      guard(ctx)
      const endpoint = ctx.db.get('webhooks', id, 'Webhook')
      for (const row of ctx.db.all('webhookDeliveries')) if (row.endpointId === id) ctx.db.remove('webhookDeliveries', row.id)
      ctx.db.remove('webhooks', id)
      const state = getMockState()
      if (state.vault) delete state.vault[id]
      audit(ctx, endpoint, 'deleted', 'deleted')
    }),
  rotateSecret: (id) =>
    request((ctx) => {
      guard(ctx)
      const current = ctx.db.get('webhooks', id, 'Webhook')
      const secret = mint(ctx, id)
      const endpoint = ctx.db.save('webhooks', { ...current, secretLast4: secret.slice(-4) })
      audit(ctx, endpoint, 'updated', 'signing secret rotated')
      return { endpoint, secret }
    }),
  deliveries: (endpointId) =>
    request((ctx) => {
      guard(ctx)
      ctx.db.get('webhooks', endpointId, 'Webhook')
      return ctx.db
        .all('webhookDeliveries')
        .filter((row) => row.endpointId === endpointId)
        .sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id))
        .slice(0, 100)
    }),
  redeliver: (deliveryId) =>
    request((ctx) => {
      guard(ctx)
      const previous = ctx.db.get('webhookDeliveries', deliveryId, 'Delivery')
      const endpoint = ctx.db.get('webhooks', previous.endpointId, 'Webhook')
      return performAttempt(ctx, endpoint, {
        eventId: previous.eventId,
        event: previous.event,
        body: previous.requestBody,
        attempt: 1,
        test: previous.test,
      })
    }),
  sendTest: (endpointId, event, outcome) =>
    request((ctx) => {
      guard(ctx)
      const endpoint = ctx.db.get('webhooks', endpointId, 'Webhook')
      const envelope = { ...samplePayload(event, ctx.timestamp), id: newId('evt_test') }
      return performAttempt(ctx, endpoint, {
        eventId: envelope.id,
        event,
        body: JSON.stringify(envelope),
        attempt: 1,
        test: true,
        outcome,
      })
    }),
}
