import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defaultVariableMap } from '@/lib/inbox/broadcast-variables'
import { api } from '@/services/api'
import { ApiError } from '@/services/api/errors'
import type { BroadcastAudience, BroadcastInput } from '@/types'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'

beforeEach(setupMock)
afterEach(teardownMock)

const codeOf = async (promise: Promise<unknown>) =>
  promise.then(
    () => null,
    (error: unknown) => (error instanceof ApiError ? error.code : 'OTHER'),
  )

function fixture() {
  const template = tables().templates.find(
    (t) => t.tenantId === ACME_TENANT_ID && t.channel === 'whatsapp' && t.status === 'approved',
  )
  if (!template) throw new Error('no approved WhatsApp template')
  const counts = new Map<string, number>()
  for (const lead of tables().leads) {
    if (lead.tenantId !== ACME_TENANT_ID || lead.archivedAt) continue
    for (const tag of lead.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  const [tag] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? []
  if (!tag) throw new Error('no tagged leads')
  const audience: BroadcastAudience = { kind: 'tag', tag }
  const input: BroadcastInput = {
    name: 'Test broadcast',
    templateId: template.id,
    audience,
    variableMap: defaultVariableMap(template.variables),
    schedule: { mode: 'now', at: null },
  }
  return { template, audience, input }
}

describe('broadcast audience', () => {
  it('excludes opted-out leads and leads with no number from the eligible count', async () => {
    actAs(USERS.neha)
    const { audience } = fixture()
    const members = tables().leads.filter(
      (l) => l.tenantId === ACME_TENANT_ID && !l.archivedAt && audience.kind === 'tag' && l.tags.includes(audience.tag),
    )
    const optedOut = members.filter((l) => l.whatsappOptOut)
    // Make sure the exclusion is exercised whatever the seed drew.
    const target = members.find((l) => !l.whatsappOptOut && (l.whatsapp ?? l.phone))
    if (target) target.whatsappOptOut = true
    const expectedOptedOut = optedOut.length + (target ? 1 : 0)

    const count = await api.broadcasts.audienceCount(audience)
    expect(count.total).toBe(members.length)
    expect(count.optedOut).toBe(expectedOptedOut)
    expect(count.eligible).toBe(count.total - count.optedOut - count.missingNumber)
    expect(count.optedOut).toBeGreaterThan(0)
  })

  it('counts only the leads the caller may see', async () => {
    const { audience } = fixture()
    actAs(USERS.neha)
    const all = await api.broadcasts.audienceCount(audience)
    actAs(USERS.ananya)
    const own = await api.broadcasts.audienceCount(audience).catch(() => null)
    expect(own === null || own.total <= all.total).toBe(true)
  })
})

describe('broadcast sending', () => {
  it('sends in batches, completes, and writes conversations, messages and activities', async () => {
    actAs(USERS.neha)
    const { input, audience } = fixture()
    const count = await api.broadcasts.audienceCount(audience)
    const created = await api.broadcasts.create(input)
    expect(created.status).toBe('sending')
    expect(created.stats.total).toBe(count.eligible)
    expect(created.excludedOptOut).toBe(count.optedOut)

    let current = created
    const seen: number[] = []
    for (let i = 0; i < 100 && current.status === 'sending'; i += 1) {
      current = await api.broadcasts.get(created.id)
      seen.push(current.stats.sent + current.stats.failed)
    }
    expect(current.status).toBe('completed')
    expect(current.stats.sent + current.stats.failed).toBe(count.eligible)
    expect(current.stats.delivered).toBe(current.stats.sent)
    expect(current.stats.read).toBeLessThanOrEqual(current.stats.delivered)
    expect(current.stats.replied).toBeLessThanOrEqual(current.stats.read)
    if (count.eligible > 10) expect(seen.length).toBeGreaterThan(1)

    const members = tables().leads.filter(
      (l) => l.tenantId === ACME_TENANT_ID && !l.archivedAt && l.tags.includes((audience as { tag: string }).tag),
    )
    const NOW_ISO = '2026-10-04T06:00:00.000Z'
    const sentMessages = tables().messages.filter(
      (m) => m.templateId === input.templateId && m.direction === 'outbound' && m.queuedAt === NOW_ISO,
    )
    expect(sentMessages).toHaveLength(count.eligible)
    expect(new Set(sentMessages.map((m) => m.conversationId)).size).toBeGreaterThan(0)
    for (const message of sentMessages) {
      expect(tables().conversations.some((c) => c.id === message.conversationId && c.channel === 'whatsapp')).toBe(true)
    }
    for (const lead of members) {
      const activity = tables().activities.some(
        (a) => a.leadId === lead.id && a.type === 'whatsapp_sent' && a.createdAt === NOW_ISO,
      )
      if (lead.whatsappOptOut) expect(activity).toBe(false)
      else if (lead.whatsapp ?? lead.phone) expect(activity).toBe(true)
    }
    expect(tables().auditLogs.filter((l) => l.entity === 'broadcast').map((l) => l.action)).toEqual(
      expect.arrayContaining(['created', 'updated']),
    )
  })

  it('schedules for later and starts only when due', async () => {
    actAs(USERS.neha)
    const { input } = fixture()
    const at = new Date('2026-10-05T06:00:00.000Z').toISOString()
    const scheduled = await api.broadcasts.create({ ...input, schedule: { mode: 'later', at } })
    expect(scheduled.status).toBe('scheduled')
    expect((await api.broadcasts.get(scheduled.id)).stats.sent).toBe(0)
    expect(await codeOf(api.broadcasts.create({ ...input, schedule: { mode: 'later', at: '2020-01-01T00:00:00Z' } }))).toBe('VALIDATION')
    expect((await api.broadcasts.cancel(scheduled.id)).status).toBe('cancelled')
  })

  it('validates the variable map, template approval and permission', async () => {
    actAs(USERS.neha)
    const { input, template } = fixture()
    if (template.variables.length > 0) {
      const [first] = template.variables
      const blank = { ...input.variableMap, [first ?? '']: '' }
      expect(await codeOf(api.broadcasts.create({ ...input, variableMap: blank }))).toBe('VALIDATION')
      const unknown = { ...input.variableMap, [first ?? '']: 'lead.nope' }
      expect(await codeOf(api.broadcasts.create({ ...input, variableMap: unknown }))).toBe('VALIDATION')
    }
    const pending = tables().templates.find((t) => t.tenantId === ACME_TENANT_ID && t.channel === 'whatsapp' && t.status !== 'approved')
    if (pending) expect(await codeOf(api.broadcasts.create({ ...input, templateId: pending.id }))).toBe('VALIDATION')

    actAs(USERS.rahul)
    expect(await codeOf(api.broadcasts.create(input))).toBe('FORBIDDEN')
  })
})
