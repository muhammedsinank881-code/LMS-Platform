import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { setMockSessionResolver } from '@/services/mock'
import { leadFormSchema, type LeadFormInput } from '@/types'
import { ACME_TENANT_ID, NORTHWIND_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import { leadById, sourceIdOf } from './capture-fixtures'
import { must } from './inbox-fixtures'

beforeEach(() => {
  setupMock()
  actAs(USERS.priya)
})
afterEach(teardownMock)

const field = (key: string, patch: Partial<LeadFormInput['fields'][number]> = {}): LeadFormInput['fields'][number] => ({
  id: `f-${key}`,
  key,
  label: key,
  placeholder: '',
  required: false,
  type: 'text',
  options: [],
  validation: {},
  ...patch,
})

function formInput(patch: Partial<LeadFormInput> = {}): LeadFormInput {
  return {
    name: 'Landing page form',
    fields: [field('name', { required: true }), field('phone', { type: 'tel', required: true }), field('email', { type: 'email' })],
    submitLabel: 'Send',
    successMessage: 'Thank you!',
    redirectUrl: null,
    consentText: null,
    spamProtection: true,
    defaults: { sourceId: sourceIdOf('landing_page'), campaignId: null, statusId: null, tags: ['lp'], assignMode: 'specific_user', assignUserId: USERS.vikram },
    notifyUserIds: [USERS.neha],
    style: { accent: '#4f46e5', theme: 'light', rounded: true },
    ...patch,
  }
}

describe('form builder validation', () => {
  it('accepts a valid form', () => {
    expect(leadFormSchema.safeParse(formInput()).success).toBe(true)
  })

  it.each([
    ['no name field', { fields: [field('phone', { type: 'tel' })] }, /name field/],
    ['no way to contact', { fields: [field('name')] }, /phone, WhatsApp number or email/],
    ['a repeated lead field', { fields: [field('name'), field('phone'), field('phone')] }, /once/],
    ['a dropdown without options', { fields: [field('name'), field('phone'), field('company', { type: 'select', options: ['one'] })] }, /two options/],
    ['a bad pattern', { fields: [field('name'), field('phone', { validation: { pattern: '(' } })] }, /regular expression/],
    ['min above max', { fields: [field('name'), field('phone', { validation: { min: 9, max: 2 } })] }, /Minimum/],
    ['an empty submit label', { submitLabel: ' ' }, /button text/],
    ['a bad accent', { style: { accent: 'blue', theme: 'light', rounded: true } }, /hex/],
    ['specific user without a user', { defaults: { ...formInput().defaults, assignUserId: null } }, /who receives/],
  ] as const)('rejects %s', (_label, patch, message) => {
    const result = leadFormSchema.safeParse(formInput(patch as Partial<LeadFormInput>))
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toMatch(message)
  })

  it('the server rejects a custom field that does not exist', async () => {
    await expect(api.leadForms.create(formInput({ fields: [...formInput().fields, field('custom.nope')] }))).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})

describe('form management', () => {
  it('creates, audits, duplicates, disables and archives', async () => {
    const form = await api.leadForms.create(formInput())
    expect(form).toMatchObject({ status: 'active', submissionCount: 0, tenantId: ACME_TENANT_ID })
    expect(tables().auditLogs.some((log) => log.entity === 'lead_form' && log.entityId === form.id && log.action === 'created')).toBe(true)

    const copy = await api.leadForms.duplicate(form.id)
    expect(copy).toMatchObject({ name: 'Landing page form (copy)', status: 'disabled' })
    expect((await api.leadForms.setStatus(form.id, 'disabled')).status).toBe('disabled')
    expect((await api.leadForms.setStatus(form.id, 'archived')).status).toBe('archived')
    await expect(api.leadForms.update(form.id, formInput())).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('managers may build forms, salespeople may not, and managers cannot see integrations or keys', async () => {
    actAs(USERS.neha)
    await expect(api.leadForms.list()).resolves.toBeInstanceOf(Array)
    await expect(api.integrations.list()).rejects.toMatchObject({ code: 'FORBIDDEN' })
    await expect(api.apiKeys.list()).rejects.toMatchObject({ code: 'FORBIDDEN' })
    actAs(USERS.ananya)
    await expect(api.leadForms.list()).rejects.toMatchObject({ code: 'FORBIDDEN' })
    await expect(api.leadForms.create(formInput())).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('does not show another workspace its forms', async () => {
    const form = await api.leadForms.create(formInput())
    actAs(USERS.priya, { tenantId: NORTHWIND_TENANT_ID })
    const others = await api.leadForms.list()
    expect(others.some((item) => item.id === form.id)).toBe(false)
  })
})

describe('public form', () => {
  async function publish(patch: Partial<LeadFormInput> = {}) {
    const form = await api.leadForms.create(formInput(patch))
    setMockSessionResolver(() => null) // visitors have no session
    return form
  }

  it('serves only the form config, never tenant or routing data', async () => {
    const form = await publish()
    const served = await api.leadForms.getPublic(form.id)
    expect(Object.keys(served).sort()).toEqual(['consentText', 'fields', 'id', 'name', 'redirectUrl', 'spamProtection', 'style', 'submitLabel', 'successMessage'])
    expect(JSON.stringify(served)).not.toMatch(/tenant|notifyUserIds|assignUserId|user-/)
  })

  it('creates a lead with the form defaults, counts the submission and notifies', async () => {
    const form = await publish()
    const result = await api.leadForms.submitPublic(form.id, { values: { name: 'Visitor One', phone: '9111100001', email: 'v1@example.com' } })
    expect(result).toEqual({ ok: true, redirectUrl: null, successMessage: 'Thank you!' })
    const lead = must(tables().leads.find((item) => item.name === 'Visitor One'), 'created lead')
    expect(lead).toMatchObject({ phone: '+919111100001', assignedTo: USERS.vikram, sourceId: sourceIdOf('landing_page'), tags: ['lp'] })
    expect(tables().activities.find((a) => a.leadId === lead.id && a.type === 'lead_created')).toMatchObject({ data: { via: 'a lead capture form' } })
    expect(tables().leadForms.find((f) => f.id === form.id)?.submissionCount).toBe(1)
    expect(tables().notifications.some((n) => n.userId === USERS.neha && n.type === 'form_submission')).toBe(true)
    const submission = must(tables().formSubmissions.find((s) => s.formId === form.id), 'submission')
    expect(submission).toMatchObject({ leadId: lead.id, spam: false })
  })

  it('captures UTM parameters and matches the campaign', async () => {
    const campaign = must(tables().campaigns.find((row) => row.tenantId === ACME_TENANT_ID && !row.archivedAt), 'campaign')
    const slug = campaign.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const form = await publish()
    await api.leadForms.submitPublic(form.id, { values: { name: 'Utm Visitor', phone: '9111100002' }, utm: { source: 'google', medium: 'cpc', campaign: slug } })
    expect(leadById(must(tables().leads.find((l) => l.name === 'Utm Visitor'), 'lead').id)).toMatchObject({ campaignId: campaign.id, utm: { source: 'google', medium: 'cpc', campaign: slug } })
  })

  it('validates against the form own rules and reports per-field errors', async () => {
    const form = await publish({ consentText: 'I agree', fields: [field('name', { required: true }), field('phone', { type: 'tel', required: true }), field('budget', { type: 'number', validation: { min: 1000 } })] })
    await expect(api.leadForms.submitPublic(form.id, { values: { name: '', phone: '123' } })).rejects.toMatchObject({ code: 'VALIDATION', fieldErrors: { name: expect.any(Array), phone: expect.any(Array), consent: expect.any(Array) } })
    await expect(api.leadForms.submitPublic(form.id, { values: { name: 'A B', phone: '9111100003', budget: '10' }, consent: true })).rejects.toMatchObject({ fieldErrors: { budget: ['Must be at least 1000'] } })
  })

  it('silently drops honeypot submissions: success screen, no lead', async () => {
    const form = await publish()
    const before = tables().leads.length
    await expect(api.leadForms.submitPublic(form.id, { values: { name: 'Bot', phone: '9111100004' }, honeypot: 'http://spam' })).resolves.toMatchObject({ ok: true })
    expect(tables().leads.length).toBe(before)
    expect(tables().formSubmissions.find((s) => s.formId === form.id)).toMatchObject({ spam: true, leadId: null })
  })

  it('rate limits rapid repeated submissions', async () => {
    const form = await publish()
    for (let i = 0; i < 3; i += 1) await api.leadForms.submitPublic(form.id, { values: { name: `Rapid ${i}`, phone: `911110001${i}` } })
    await expect(api.leadForms.submitPublic(form.id, { values: { name: 'Rapid 4', phone: '9111100019' } })).rejects.toMatchObject({ code: 'CONFLICT', message: expect.stringMatching(/too quickly/) })
  })

  it('does not serve a disabled or unknown form', async () => {
    const form = await api.leadForms.create(formInput())
    await api.leadForms.setStatus(form.id, 'disabled')
    setMockSessionResolver(() => null)
    await expect(api.leadForms.getPublic(form.id)).rejects.toMatchObject({ code: 'NOT_FOUND' })
    await expect(api.leadForms.submitPublic('form-nope', { values: {} })).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('summarizes submissions per day with the latest list', async () => {
    const form = await publish()
    await api.leadForms.submitPublic(form.id, { values: { name: 'Count Me', phone: '9111100005' } })
    actAs(USERS.priya)
    const summary = await api.leadForms.submissions(form.id)
    expect(summary.total).toBe(1)
    expect(summary.daily).toHaveLength(14)
    expect(summary.daily.at(-1)?.count).toBe(1)
    expect(summary.latest[0].leadId).toBeTruthy()
  })
})
