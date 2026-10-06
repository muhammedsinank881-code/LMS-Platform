import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { INTEGRATION_PROVIDERS, type IntegrationConfig } from '@/types'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import { leadById, sourceIdOf } from './capture-fixtures'
import { advance, must } from './inbox-fixtures'

beforeEach(() => {
  setupMock()
  actAs(USERS.priya)
})
afterEach(teardownMock)

const whatsappConfig = (): IntegrationConfig => ({
  provider: 'whatsapp',
  businessAccountId: '111',
  phoneNumberId: '222',
  displayName: 'Support',
  quality: 'green',
  token: { masked: '' },
  verifyToken: 'vf_abc',
  callbackUrl: 'https://api.test/wa',
  webhookVerified: false,
  templatesSyncedAt: null,
})

const telephonyConfig = (): IntegrationConfig => ({ provider: 'telephony', vendor: 'CloudCall', clickToCall: true, syncCallLogs: true, extensions: [] })

const adsConfig = (provider: 'facebook_lead_ads' | 'linkedin' | 'google_ads', over: Partial<Extract<IntegrationConfig, { forms: unknown }>> = {}): IntegrationConfig => ({
  provider,
  pageId: 'p1',
  pageName: 'Page',
  accountIds: ['a1'],
  forms: [
    {
      formId: 'form-1',
      formName: 'Form one',
      questions: ['full_name', 'phone_number', 'sqft'],
      fields: [
        { sourceField: 'full_name', leadField: 'name' },
        { sourceField: 'phone_number', leadField: 'phone' },
        { sourceField: 'sqft', leadField: 'custom.company_size' },
      ],
      defaults: { sourceId: null, campaignId: null, statusId: null, tags: ['ads-form'], assignMode: 'specific_user', assignUserId: USERS.vikram },
    },
  ],
  syncCampaigns: false,
  syncSpend: true,
  lastLeadAt: null,
  ...over,
})

const get = async (provider: (typeof INTEGRATION_PROVIDERS)[number]) => must((await api.integrations.list()).find((row) => row.provider === provider), provider)

describe('status transitions', () => {
  it('lists every provider for the workspace, with the seeded mix of states', async () => {
    const rows = await api.integrations.list()
    expect(rows.map((row) => row.provider)).toEqual([...INTEGRATION_PROVIDERS])
    expect(rows.every((row) => row.tenantId === ACME_TENANT_ID)).toBe(true)
    expect(new Set(rows.map((row) => row.status))).toEqual(new Set(['connected', 'expired', 'error', 'not_connected']))
  })

  it('not_connected -> connecting, and cancelling returns to not_connected', async () => {
    expect((await get('telephony')).status).toBe('not_connected')
    expect(await api.integrations.begin('telephony')).toMatchObject({ status: 'connecting' })
    await expect(api.integrations.begin('whatsapp')).rejects.toMatchObject({ code: 'CONFLICT' })
    expect(await api.integrations.disconnect('telephony')).toMatchObject({ status: 'not_connected' })
    expect(tables().auditLogs.some((log) => log.entity === 'integration' && log.entityId === 'int-telephony')).toBe(false)
  })

  it('connects with a masked token that is never stored in full', async () => {
    await api.integrations.disconnect('whatsapp')
    expect(await api.integrations.begin('whatsapp')).toMatchObject({ status: 'connecting' })
    const connected = await api.integrations.connect({ provider: 'whatsapp', accountLabel: '+91 90000 00000', config: whatsappConfig(), secret: 'EAAGsupersecrettoken5521' })
    expect(connected).toMatchObject({ status: 'connected', connectedBy: USERS.priya, accountLabel: '+91 90000 00000', error: null })
    expect(connected.config).toMatchObject({ provider: 'whatsapp', token: { masked: '••••5521' } })
    expect(JSON.stringify(tables())).not.toContain('supersecrettoken')
    expect(tables().integrationEvents.some((e) => e.integrationId === 'int-whatsapp' && e.type === 'connected')).toBe(true)
    expect(tables().auditLogs.some((log) => log.entity === 'integration' && log.action === 'created' && JSON.stringify(log).includes('supersecret'))).toBe(false)
    await expect(api.integrations.connect({ provider: 'whatsapp', accountLabel: 'x', config: whatsappConfig(), secret: 'y' })).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('validates provider configs', async () => {
    await expect(api.integrations.connect({ provider: 'telephony', accountLabel: 'x', config: whatsappConfig() })).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(api.integrations.connect({ provider: 'telephony', accountLabel: 'x', config: { ...telephonyConfig(), vendor: ' ' } as IntegrationConfig })).rejects.toMatchObject({ code: 'VALIDATION' })
    await api.integrations.disconnect('whatsapp')
    await expect(api.integrations.connect({ provider: 'whatsapp', accountLabel: 'x', config: whatsappConfig() })).rejects.toMatchObject({ fieldErrors: { token: expect.any(Array) } })
    await expect(api.integrations.connect({ provider: 'linkedin', accountLabel: 'x', config: adsConfig('linkedin', { forms: [] }) })).rejects.toMatchObject({ fieldErrors: { forms: expect.any(Array) } })
    const noContact = adsConfig('linkedin')
    if ('forms' in noContact) noContact.forms[0].fields = [{ sourceField: 'full_name', leadField: 'name' }]
    await expect(api.integrations.connect({ provider: 'linkedin', accountLabel: 'x', config: noContact })).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('error and expiry surface a notification to admins; reconnect restores them', async () => {
    const failed = await api.simulator.failIntegration('whatsapp', 'error')
    expect(failed).toMatchObject({ status: 'error', error: { kind: 'error' } })
    expect(failed.error?.suggestedFix).toBeTruthy()
    expect(tables().notifications.some((n) => n.userId === USERS.arjun && n.type === 'integration_alert')).toBe(true)
    expect((await get('whatsapp')).health.ok).toBe(false)

    expect(await api.integrations.reconnect('whatsapp')).toMatchObject({ status: 'connected', error: null })
    const expired = await api.simulator.failIntegration('email', 'expired')
    expect(expired).toMatchObject({ status: 'expired', error: { kind: 'expired' } })
    expect(await api.integrations.reconnect('email')).toMatchObject({ status: 'connected' })
    await expect(api.integrations.reconnect('email')).rejects.toMatchObject({ code: 'CONFLICT' })
    await expect(api.simulator.failIntegration('telephony', 'error')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('disconnect clears the config but keeps the history, and audits it', async () => {
    const row = await api.integrations.disconnect('facebook_lead_ads')
    expect(row).toMatchObject({ status: 'not_connected', config: null, connectedBy: null })
    expect(tables().integrationEvents.filter((e) => e.integrationId === 'int-facebook_lead_ads').map((e) => e.type)).toContain('disconnected')
    expect(tables().auditLogs.some((log) => log.entity === 'integration' && log.action === 'deleted')).toBe(true)
    await expect(api.integrations.sendTestLead('facebook_lead_ads')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('keeps only the last 50 events', async () => {
    await api.integrations.disconnect('telephony')
    await api.integrations.connect({ provider: 'telephony', accountLabel: 'Tel', config: telephonyConfig() })
    for (let i = 0; i < 55; i += 1) await api.integrations.testCall()
    expect(await api.integrations.events('telephony')).toHaveLength(50)
  })

  it('is gated by role', async () => {
    for (const user of [USERS.neha, USERS.rahul, USERS.ananya]) {
      actAs(user)
      await expect(api.integrations.list()).rejects.toMatchObject({ code: 'FORBIDDEN' })
      await expect(api.integrations.connect({ provider: 'telephony', accountLabel: 'x', config: telephonyConfig() })).rejects.toMatchObject({ code: 'FORBIDDEN' })
    }
    actAs(USERS.arjun)
    await expect(api.integrations.list()).resolves.toHaveLength(INTEGRATION_PROVIDERS.length)
  })
})

describe('provider actions', () => {
  it('sends a test lead through the real pipeline with the mapping, custom fields and defaults', async () => {
    await api.integrations.disconnect('linkedin')
    await api.integrations.connect({ provider: 'linkedin', accountLabel: 'LI', config: adsConfig('linkedin') })
    const { leadId, duplicate } = await api.integrations.sendTestLead('linkedin')
    expect(duplicate).toBe(false)
    const lead = leadById(leadId)
    expect(lead).toMatchObject({ sourceId: sourceIdOf('linkedin'), assignedTo: USERS.vikram, tags: ['ads-form'] })
    expect(lead.name).toMatch(/^Test Lead/)
    expect(lead.customFields).toMatchObject({ company_size: expect.anything() })
    const integration = await get('linkedin')
    expect(integration.leadsReceived).toBe(1)
    expect(tables().integrationEvents.some((e) => e.integrationId === 'int-linkedin' && e.type === 'lead_received')).toBe(true)
    expect(tables().activities.find((a) => a.leadId === leadId && a.type === 'lead_created')).toMatchObject({ data: { via: 'LinkedIn Lead Gen' } })
  })

  it('cannot send a test lead through an expired integration, or for a non-lead provider', async () => {
    await expect(api.integrations.sendTestLead('instagram')).rejects.toMatchObject({ code: 'CONFLICT' })
    await expect(api.integrations.sendTestLead('email')).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('updates the mapping of a connected integration without touching the secret', async () => {
    const row = await get('facebook_lead_ads')
    const config = must(row.config, 'config')
    if (!('forms' in config)) throw new Error('not a lead ads config')
    const next = { ...config, forms: config.forms.map((form) => ({ ...form, fields: [...form.fields, { sourceField: 'city', leadField: 'location' }] })) }
    const saved = await api.integrations.update('facebook_lead_ads', { config: next })
    expect(saved.config && 'forms' in saved.config && saved.config.forms[0].fields.at(-1)).toEqual({ sourceField: 'city', leadField: 'location' })
    expect(tables().integrationEvents.some((e) => e.type === 'config_changed')).toBe(true)
  })

  it('whatsapp: verifies the webhook and syncs templates', async () => {
    await api.integrations.disconnect('whatsapp')
    await api.integrations.connect({ provider: 'whatsapp', accountLabel: 'WA', config: whatsappConfig(), secret: 'tokentoken1234' })
    const verified = await api.integrations.verifyWebhook()
    expect(verified.config).toMatchObject({ webhookVerified: true })
    const { count } = await api.integrations.syncTemplates()
    expect(count).toBe(tables().templates.filter((t) => t.tenantId === ACME_TENANT_ID && t.channel === 'whatsapp').length)
  })

  it('email: validates the address and records the test', async () => {
    await expect(api.integrations.sendTestEmail('nope')).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(api.integrations.sendTestEmail('me@example.com')).resolves.toEqual({ sentTo: 'me@example.com' })
    const email = await get('email')
    expect(email.config && 'testSentAt' in email.config && email.config.testSentAt).toBeTruthy()
  })

  it('telephony: a test call creates a call log', async () => {
    await api.integrations.disconnect('telephony')
    await api.integrations.connect({ provider: 'telephony', accountLabel: 'Tel', config: telephonyConfig() })
    const before = tables().callLogs.length
    const { callLogId } = await api.integrations.testCall()
    expect(tables().callLogs.length).toBe(before + 1)
    expect(tables().callLogs.find((c) => c.id === callLogId)).toMatchObject({ outcome: 'connected', direction: 'outbound' })
  })

  it('google ads: spend sync creates synced entries once per campaign and day', async () => {
    await api.integrations.reconnect('google_ads')
    advance(3 * 86_400_000) // past the seeded spend, so yesterday is open
    const before = tables().spendEntries.length
    const first = await api.integrations.syncSpend()
    expect(first.created).toBeGreaterThan(0)
    expect(tables().spendEntries.length).toBe(before + first.created)
    expect(tables().spendEntries.filter((s) => s.source === 'synced').every((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date))).toBe(true)
    expect((await api.integrations.syncSpend()).created).toBe(0)
  })

  it('simulator: a WhatsApp lead from an unknown number creates a lead and a conversation', async () => {
    const result = await api.simulator.whatsappLead('+919123400000', 'Hello, is this the sofa shop?')
    const lead = leadById(result.leadId)
    expect(lead).toMatchObject({ phone: '+919123400000', sourceId: sourceIdOf('whatsapp') })
    expect(tables().conversations.some((c) => c.leadId === lead.id && c.channel === 'whatsapp')).toBe(true)
  })
})
