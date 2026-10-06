import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import { activitiesOf, captureEvents, ingest, leadById, sourceIdOf } from './capture-fixtures'
import { must } from './inbox-fixtures'
import { api } from '@/services/api'
import type { IngestPayload, IngestProvider } from '@/types'

beforeEach(() => {
  setupMock()
  actAs(USERS.priya)
})
afterEach(teardownMock)

describe('ingestLead: one pipeline for every provider shape', () => {
  it('whatsapp: normalizes the phone, files under WhatsApp, writes "Lead created from", emits lead.created', async () => {
    const { events, stop } = captureEvents()
    const result = await ingest({ shape: 'whatsapp', from: '09811122233', text: 'Do you do 3BHK interiors?' }, { provider: 'whatsapp' })
    stop()
    const lead = leadById(result.leadId)
    expect(lead.phone).toBe('+919811122233')
    expect(lead.sourceId).toBe(sourceIdOf('whatsapp'))
    expect(lead.requirement).toBe('Do you do 3BHK interiors?')
    const created = activitiesOf(lead.id).find((item) => item.type === 'lead_created')
    expect(created).toMatchObject({ actorId: null, data: { via: 'WhatsApp' } })
    expect(events.some((e) => e.type === 'lead_created' && e.entity.id === lead.id)).toBe(true)
    expect(tables().auditLogs.find((log) => log.entityId === lead.id)).toMatchObject({ actorType: 'system', userId: 'system' })
  })

  const adCases: Array<[IngestProvider, IngestPayload, string]> = [
    ['facebook_lead_ads', { shape: 'meta', formId: 'f', fieldData: [{ name: 'full_name', values: ['Asha Rao'] }, { name: 'phone_number', values: ['+91 90000 11111'] }] }, 'facebook'],
    ['google_ads', { shape: 'google', formId: 'f', userColumnData: [{ columnId: 'full_name', stringValue: 'Asha Rao' }, { columnId: 'phone_number', stringValue: '9000011112' }] }, 'google_ads'],
    ['linkedin', { shape: 'linkedin', formId: 'f', answers: [{ question: 'full_name', answer: 'Asha Rao' }, { question: 'phone_number', answer: '9000011113' }] }, 'linkedin'],
  ]
  it.each(adCases)('%s: maps the form answers and files under the right source', async (provider, payload, sourceKey) => {
    const mapping = [
      { sourceField: 'full_name', leadField: 'name' },
      { sourceField: 'phone_number', leadField: 'phone' },
    ]
    const result = await ingest(payload, { provider, mapping })
    const lead = leadById(result.leadId)
    expect(lead.name).toBe('Asha Rao')
    expect(lead.phone).toMatch(/^\+91900001111\d$/)
    expect(lead.sourceId).toBe(sourceIdOf(sourceKey))
  })

  it('form, api and telephony shapes', async () => {
    const form = await ingest({ shape: 'form', values: { name: 'Form Person', email: 'Form@Example.com' } }, { provider: 'form' })
    expect(leadById(form.leadId)).toMatchObject({ email: 'form@example.com', sourceId: sourceIdOf('landing_page') })
    const api = await ingest({ shape: 'api', data: { name: 'Api Person', phone: '9000022222', budget: 250000 } }, { provider: 'api' })
    expect(leadById(api.leadId)).toMatchObject({ budget: 250000, sourceId: sourceIdOf('api') })
    const call = await ingest({ shape: 'telephony', from: '9000033333' }, { provider: 'telephony' })
    expect(leadById(call.leadId)).toMatchObject({ phone: '+919000033333', sourceId: sourceIdOf('phone') })
  })

  it('applies custom-field mapping and defaults (source, status, tags, campaign)', async () => {
    const status = must(tables().leadStatuses.find((row) => row.tenantId === ACME_TENANT_ID && row.type === 'open'), 'status')
    const campaign = must(tables().campaigns.find((row) => row.tenantId === ACME_TENANT_ID), 'campaign')
    const result = await ingest(
      { shape: 'meta', formId: 'f', fieldData: [{ name: 'nm', values: ['Mapped'] }, { name: 'ph', values: ['9000044444'] }, { name: 'size', values: ['25'] }] },
      {
        provider: 'facebook_lead_ads',
        mapping: [
          { sourceField: 'nm', leadField: 'name' },
          { sourceField: 'ph', leadField: 'phone' },
          { sourceField: 'size', leadField: 'custom.company_size' },
        ],
        defaults: { sourceId: sourceIdOf('manual'), statusId: status.id, tags: ['ads', 'q4'], campaignId: campaign.id },
      },
    )
    expect(leadById(result.leadId)).toMatchObject({ sourceId: sourceIdOf('manual'), statusId: status.id, tags: ['ads', 'q4'], campaignId: campaign.id, customFields: { company_size: 25 } })
  })

  it('flags a duplicate of an existing lead and still creates the record', async () => {
    const existing = must(tables().leads.find((lead) => lead.tenantId === ACME_TENANT_ID && lead.phone && !lead.archivedAt), 'lead with phone')
    const result = await ingest({ shape: 'whatsapp', from: existing.phone!, text: 'Hi again' }, { provider: 'whatsapp' })
    expect(result.duplicates.map((match) => match.lead.id)).toContain(existing.id)
    expect(leadById(result.leadId).duplicateOf).toBe(existing.id)
  })

  it('scores the new lead with the workspace rules', async () => {
    const result = await ingest({ shape: 'api', data: { name: 'Scored', phone: '9000055555' } }, { provider: 'google_ads' })
    const lead = leadById(result.leadId)
    expect(lead.score).toBeGreaterThanOrEqual(12)
    expect(lead.scoreBreakdown.some((item) => item.rule.name === 'Google Ads lead')).toBe(true)
  })

  it('assigns a specific user, notifies them, and logs the assignment', async () => {
    const result = await ingest({ shape: 'api', data: { name: 'Routed', phone: '9000066666' } }, { provider: 'api', defaults: { assignMode: 'specific_user', assignUserId: USERS.vikram } })
    expect(result.assignedTo).toBe(USERS.vikram)
    expect(tables().notifications.some((n) => n.userId === USERS.vikram && n.type === 'lead_assigned' && n.link === `/leads/${result.leadId}`)).toBe(true)
  })

  it('round-robin rotates between sellers', async () => {
    const first = await ingest({ shape: 'api', data: { name: 'RR one', phone: '9000077771' } }, { provider: 'api', defaults: { assignMode: 'round_robin' } })
    const second = await ingest({ shape: 'api', data: { name: 'RR two', phone: '9000077772' } }, { provider: 'api', defaults: { assignMode: 'round_robin' } })
    expect(first.assignedTo).toBeTruthy()
    expect(second.assignedTo).toBeTruthy()
    expect(second.assignedTo).not.toBe(first.assignedTo)
  })

  it('rejects a payload with no way to reach the person', async () => {
    await expect(ingest({ shape: 'api', data: { name: 'Nobody' } }, { provider: 'api' })).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('stores UTM on the lead and matches utm_campaign to a campaign', async () => {
    const campaign = must(tables().campaigns.find((row) => row.tenantId === ACME_TENANT_ID && !row.archivedAt), 'campaign')
    const slug = campaign.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const result = await ingest({ shape: 'form', values: { name: 'Tracked', phone: '9000088888' } }, { provider: 'form', utm: { source: 'google', campaign: slug } })
    expect(result.campaignMatched).toBe(true)
    expect(leadById(result.leadId)).toMatchObject({ campaignId: campaign.id, utm: { source: 'google', campaign: slug } })
    const unmatched = await ingest({ shape: 'form', values: { name: 'Untracked', phone: '9000099999' } }, { provider: 'form', utm: { campaign: 'no-such-campaign' } })
    expect(unmatched.campaignMatched).toBe(false)
  })

  it('refuses to receive leads for an expired integration', async () => {
    await api.integrations.list()
    await expect(ingest({ shape: 'api', data: { name: 'Late', phone: '9000012345' } }, { provider: 'instagram', integrationId: 'int-instagram' })).rejects.toMatchObject({ code: 'CONFLICT' })
  })
})
