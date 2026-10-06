import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { verifySignature } from '@/lib/webhooks/signature'
import { api } from '@/services/api'
import { WEBHOOK_PAUSE_AFTER, type WebhookInput } from '@/types'
import { getMockState } from '@/services/mock/core/state'
import { USERS, NOW, actAs, setupMock, tables, teardownMock } from './helpers'
import { sourceIdOf } from './capture-fixtures'
import { advance, must } from './inbox-fixtures'

beforeEach(() => {
  setupMock()
  actAs(USERS.priya)
})
afterEach(teardownMock)

const MIN = 60_000

const input = (patch: Partial<WebhookInput> = {}): WebhookInput => ({
  url: 'https://hooks.test/leadflow',
  description: 'Test endpoint',
  events: ['lead.created'],
  enabled: true,
  headers: [],
  filter: null,
  ...patch,
})

let phoneSeq = 0
const createLead = () =>
  api.leads.create({ name: `Hooked Lead ${phoneSeq}`, phone: `90000${String(10000 + phoneSeq++)}`, sourceId: sourceIdOf('facebook') })

const deliveriesOf = (endpointId: string) => tables().webhookDeliveries.filter((row) => row.endpointId === endpointId)

describe('endpoint management and secrets', () => {
  it('shows the signing secret once and only a masked tail afterwards', async () => {
    const { endpoint, secret } = await api.webhooks.create(input({ headers: [{ name: 'X-Auth', value: 'supersecretheader9876' }] }))
    expect(secret).toMatch(/^whsec_[A-Za-z0-9]{32}$/)
    expect(endpoint.secretLast4).toBe(secret.slice(-4))
    expect(endpoint.headers).toEqual([{ name: 'X-Auth', masked: '••••9876' }])
    const listed = JSON.stringify(await api.webhooks.list())
    expect(listed).not.toContain(secret)
    expect(listed).not.toContain('supersecretheader')
    expect(JSON.stringify(tables())).not.toContain(secret)
    expect(JSON.stringify(tables().auditLogs)).not.toMatch(/whsec_|supersecretheader/)
  })

  it('rotates the secret and records only that it happened', async () => {
    const { endpoint, secret } = await api.webhooks.create(input())
    const rotated = await api.webhooks.rotateSecret(endpoint.id)
    expect(rotated.secret).not.toBe(secret)
    expect(rotated.endpoint.secretLast4).toBe(rotated.secret.slice(-4))
    expect(tables().auditLogs.some((log) => log.entity === 'webhook' && log.newValue?.event === 'signing secret rotated')).toBe(true)
    expect(JSON.stringify(tables().auditLogs)).not.toContain(rotated.secret)
  })

  it('validates https, events, header names and reserved headers', async () => {
    await expect(api.webhooks.create(input({ url: 'http://insecure.test' }))).rejects.toMatchObject({ code: 'VALIDATION', message: expect.stringMatching(/https/) })
    await expect(api.webhooks.create(input({ url: 'nope' }))).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(api.webhooks.create(input({ events: [] }))).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(api.webhooks.create(input({ headers: [{ name: 'bad name', value: 'x' }] }))).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(api.webhooks.create(input({ headers: [{ name: 'X-LeadFlow-Signature', value: 'x' }] }))).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(api.webhooks.create(input({ headers: [{ name: 'X-Auth' }] }))).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('is limited to the API keys section, but automation editors can list endpoint options', async () => {
    await api.webhooks.create(input())
    actAs(USERS.neha)
    await expect(api.webhooks.list()).rejects.toMatchObject({ code: 'FORBIDDEN' })
    await expect(api.webhooks.options()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ label: 'Test endpoint' })]))
    actAs(USERS.ananya)
    await expect(api.webhooks.options()).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})

describe('dispatching real events', () => {
  it('queues a signed delivery for a subscribed endpoint when a lead is created', async () => {
    const { endpoint, secret } = await api.webhooks.create(input())
    const lead = await createLead()
    const delivery = must(deliveriesOf(endpoint.id)[0], 'delivery')
    expect(delivery).toMatchObject({ event: 'lead.created', status: 'success', httpStatus: 200, attempt: 1, test: false })
    const body = JSON.parse(delivery.requestBody)
    expect(body).toMatchObject({ type: 'lead.created', data: { lead: { id: lead.id, source: 'Facebook' } } })
    const header = delivery.requestHeaders['X-LeadFlow-Signature']
    expect(verifySignature(secret, delivery.requestBody, header, Math.floor(NOW.getTime() / 1000))).toBe(true)
    expect(delivery.requestHeaders['X-LeadFlow-Event']).toBe('lead.created')
  })

  it('skips endpoints that are not subscribed, disabled, filtered out or in another workspace', async () => {
    const other = await api.webhooks.create(input({ events: ['deal.won'] }))
    const off = await api.webhooks.create(input({ enabled: false }))
    const filtered = await api.webhooks.create(input({ filter: { sourceIds: [sourceIdOf('google_ads')] } }))
    const matching = await api.webhooks.create(input({ filter: { sourceIds: [sourceIdOf('facebook')] } }))
    await createLead()
    expect(deliveriesOf(other.endpoint.id)).toHaveLength(0)
    expect(deliveriesOf(off.endpoint.id)).toHaveLength(0)
    expect(deliveriesOf(filtered.endpoint.id)).toHaveLength(0)
    expect(deliveriesOf(matching.endpoint.id)).toHaveLength(1)
  })

  it('also delivers assignment and conversion events', async () => {
    const { endpoint } = await api.webhooks.create(input({ events: ['lead.assigned', 'lead.converted'] }))
    const lead = await createLead()
    await api.leads.assign(lead.id, USERS.vikram)
    await api.leads.convertToCustomer(lead.id)
    const events = deliveriesOf(endpoint.id).map((row) => row.event)
    expect(events).toContain('lead.assigned')
    expect(events).toContain('lead.converted')
  })

  it('redacts secrets in logged deliveries', async () => {
    const { endpoint } = await api.webhooks.create(input({ headers: [{ name: 'X-Token', value: 'supersecretheader9876' }] }))
    await createLead()
    const delivery = must(deliveriesOf(endpoint.id)[0], 'delivery')
    expect(JSON.stringify(delivery)).not.toContain('supersecretheader')
    expect(delivery.requestHeaders['X-Token']).toBe('[redacted]')
    const viaApi = JSON.stringify(await api.webhooks.deliveries(endpoint.id))
    expect(viaApi).not.toMatch(/whsec_|supersecretheader/)
  })
})

describe('retries, health and auto-pause', () => {
  async function failing() {
    await api.simulator.setWebhookOutcome('http_500')
    return api.webhooks.create(input())
  }

  it('retries a failing delivery at 1, 5 and 30 minutes, then gives up', async () => {
    const { endpoint } = await failing()
    await createLead()
    const attempts = () => deliveriesOf(endpoint.id).sort((a, b) => a.attempt - b.attempt)
    expect(attempts().map((a) => [a.attempt, a.status])).toEqual([[1, 'retrying']])
    expect(new Date(attempts()[0].nextRetryAt!).getTime() - NOW.getTime()).toBe(1 * MIN)

    advance(1 * MIN + 1)
    await api.webhooks.list() // any request polls the retry queue
    expect(attempts().map((a) => [a.attempt, a.status])).toEqual([[1, 'failed'], [2, 'retrying']])

    advance(1 * MIN + 1 + 5 * MIN + 1)
    await api.webhooks.list()
    expect(attempts().map((a) => a.attempt)).toEqual([1, 2, 3])
    expect(new Date(attempts()[2].nextRetryAt!).getTime() - new Date(attempts()[2].at).getTime()).toBe(30 * MIN)

    advance(1 * MIN + 5 * MIN + 30 * MIN + 10)
    await api.webhooks.list()
    expect(attempts().map((a) => [a.attempt, a.status])).toEqual([[1, 'failed'], [2, 'failed'], [3, 'failed'], [4, 'failed']])
    advance(2 * 60 * MIN)
    await api.webhooks.list()
    expect(attempts()).toHaveLength(4)
  })

  it('marks an endpoint failing, then pauses it and tells every admin', async () => {
    const { endpoint } = await failing()
    for (let i = 0; i < WEBHOOK_PAUSE_AFTER; i += 1) await createLead()
    const saved = must(tables().webhooks.find((row) => row.id === endpoint.id), 'endpoint')
    expect(saved).toMatchObject({ status: 'paused', consecutiveFailures: WEBHOOK_PAUSE_AFTER })
    expect(saved.pausedReason).toMatch(/Paused automatically/)
    for (const adminId of [USERS.priya, USERS.arjun]) {
      expect(tables().notifications.some((n) => n.userId === adminId && n.type === 'integration_alert' && n.title === 'Webhook paused')).toBe(true)
    }
    const before = deliveriesOf(endpoint.id).length
    await createLead()
    expect(deliveriesOf(endpoint.id)).toHaveLength(before)
    const view = must((await api.webhooks.list()).find((row) => row.id === endpoint.id), 'view')
    expect(view.health.failing).toBe(true)
    expect(view.health.successRate).toBe(0)
  })

  it('resumes when it is enabled again, and a success resets the failure streak', async () => {
    const { endpoint } = await failing()
    for (let i = 0; i < WEBHOOK_PAUSE_AFTER; i += 1) await createLead()
    await api.simulator.setWebhookOutcome('success')
    await api.webhooks.update(endpoint.id, input())
    expect(tables().webhooks.find((row) => row.id === endpoint.id)).toMatchObject({ status: 'active', consecutiveFailures: 0, pausedReason: null })
    await createLead()
    expect(tables().webhooks.find((row) => row.id === endpoint.id)).toMatchObject({ lastDeliveryStatus: 'success', consecutiveFailures: 0 })
  })

  it('redelivers manually as a fresh attempt with the same payload', async () => {
    const { endpoint } = await failing()
    await createLead()
    const first = must(deliveriesOf(endpoint.id)[0], 'delivery')
    await api.simulator.setWebhookOutcome('success')
    const again = await api.webhooks.redeliver(first.id)
    expect(again).toMatchObject({ status: 'success', attempt: 1, eventId: first.eventId, requestBody: first.requestBody })
    expect(again.id).not.toBe(first.id)
  })

  it('send test event: configurable outcome, never retried or counted toward pausing', async () => {
    const { endpoint } = await api.webhooks.create(input({ events: ['deal.won'] }))
    const ok = await api.webhooks.sendTest(endpoint.id, 'deal.won')
    expect(ok).toMatchObject({ status: 'success', test: true, event: 'deal.won' })
    expect(JSON.parse(ok.requestBody)).toMatchObject({ type: 'deal.won', data: { deal: { id: 'D-1007' } } })
    const timeout = await api.webhooks.sendTest(endpoint.id, 'lead.created', 'timeout')
    expect(timeout).toMatchObject({ status: 'failed', httpStatus: null, nextRetryAt: null, durationMs: 10_000 })
    const http500 = await api.webhooks.sendTest(endpoint.id, 'lead.created', 'http_500')
    expect(http500).toMatchObject({ status: 'failed', httpStatus: 500 })
    expect(tables().webhooks.find((row) => row.id === endpoint.id)).toMatchObject({ consecutiveFailures: 0, status: 'active' })
  })

  it('removing an endpoint removes its deliveries and its secret', async () => {
    const { endpoint } = await api.webhooks.create(input())
    await createLead()
    await api.webhooks.remove(endpoint.id)
    expect(deliveriesOf(endpoint.id)).toHaveLength(0)
    expect(getMockState().vault?.[endpoint.id]).toBeUndefined()
  })
})

describe('the automation "Call a webhook" action', () => {
  it('delivers through the same dispatcher', async () => {
    const { endpoint } = await api.webhooks.create(input({ events: ['deal.won'] }))
    const { performAttempt } = await import('@/services/mock/webhooks/deliver')
    const saved = must(tables().webhooks.find((row) => row.id === endpoint.id), 'endpoint')
    const { request } = await import('@/services/mock/core/context')
    await request((ctx) => performAttempt(ctx, saved, { eventId: 'evt-auto', event: 'automation.called', body: '{"data":{}}', attempt: 1 }))
    expect(deliveriesOf(endpoint.id).find((row) => row.event === 'automation.called')).toMatchObject({ status: 'success' })
  })
})
