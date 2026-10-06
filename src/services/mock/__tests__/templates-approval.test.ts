import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import { TEMPLATE_BODY, advance, must } from './inbox-fixtures'

beforeEach(setupMock)
afterEach(teardownMock)

const REVIEW_MS = 5_000

function draftInput(body = TEMPLATE_BODY) {
  return { name: 'Quote ready', channel: 'whatsapp' as const, category: 'utility' as const, language: 'en', body }
}

function auditFor(templateId: string) {
  return tables().auditLogs.filter((row) => row.entityId === templateId).map((row) => row.action)
}

describe('template approval lifecycle', () => {
  it('goes draft → pending → approved after the simulated review', async () => {
    actAs(USERS.arjun)
    const draft = await api.templates.create(draftInput())
    expect(draft.status).toBe('draft')

    const pending = await api.templates.submitForApproval(draft.id)
    expect(pending.status).toBe('pending')
    expect((await api.templates.listAll()).find((row) => row.id === draft.id)?.status).toBe('pending')

    advance(REVIEW_MS)
    const reviewed = must((await api.templates.listAll()).find((row) => row.id === draft.id), 'template')
    expect(reviewed.status).toBe('approved')
    expect(reviewed.rejectionReason).toBeNull()
  })

  it('rejects a body that starts or ends with a variable, with the reason shown', async () => {
    actAs(USERS.arjun)
    const draft = await api.templates.create(draftInput('{{lead.name}}, your quote is ready'))
    await api.templates.submitForApproval(draft.id)
    advance(REVIEW_MS)
    const reviewed = must((await api.templates.listAll()).find((row) => row.id === draft.id), 'template')
    expect(reviewed.status).toBe('rejected')
    expect(reviewed.rejectionReason).toMatch(/start or end with a variable/i)
  })

  it('lets the author edit a rejected template and resubmit it for approval', async () => {
    actAs(USERS.arjun)
    const draft = await api.templates.create(draftInput('Quote for you, {{lead.name}}'))
    await api.templates.submitForApproval(draft.id)
    advance(REVIEW_MS)
    expect((await api.templates.listAll()).find((row) => row.id === draft.id)?.status).toBe('rejected')

    const edited = await api.templates.update(draft.id, { body: 'Hello {{lead.name}}, your quote is ready.' })
    expect(edited.status).toBe('draft')
    expect(edited.rejectionReason).toBeNull()
    await api.templates.submitForApproval(draft.id)
    advance(REVIEW_MS * 2)
    expect((await api.templates.listAll()).find((row) => row.id === draft.id)?.status).toBe('approved')
  })

  it('the simulator can force either outcome', async () => {
    actAs(USERS.arjun)
    const first = await api.templates.create(draftInput())
    const second = await api.templates.create({ ...draftInput(), name: 'Second' })
    await api.templates.submitForApproval(first.id)
    await api.templates.submitForApproval(second.id)

    const approved = await api.simulator.resolveTemplate({ id: first.id, outcome: 'approved' })
    expect(approved.status).toBe('approved')
    const rejected = await api.simulator.resolveTemplate({ id: second.id, outcome: 'rejected', reason: 'Needs a footer' })
    expect(rejected.status).toBe('rejected')
    expect(rejected.rejectionReason).toBe('Needs a footer')
    await expect(api.simulator.resolveTemplate({ id: second.id, outcome: 'rejected', reason: ' ' })).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})

describe('after approval', () => {
  it('locks the template, but it can be cloned into an editable draft', async () => {
    actAs(USERS.arjun)
    const approved = must(tables().templates.find((row) => row.status === 'approved'), 'an approved template')
    await expect(api.templates.update(approved.id, { body: 'Changed' })).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(api.templates.submitForApproval(approved.id)).rejects.toMatchObject({ code: 'VALIDATION' })

    const copy = await api.templates.clone(approved.id)
    expect(copy.status).toBe('draft')
    expect(copy.name).toContain('(copy)')
    expect(copy.id).not.toBe(approved.id)
    await expect(api.templates.update(copy.id, { body: 'Hello {{lead.name}}, edited copy.' })).resolves.toMatchObject({ status: 'draft' })
  })
})

describe('template validation and audit', () => {
  it('only accepts known variables and the workspace\'s real custom fields', async () => {
    actAs(USERS.arjun)
    await expect(api.templates.create(draftInput('Hi {{lead.name}}, see {{made.up}} today.'))).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(api.templates.create(draftInput('Hi {{lead.name}}, GST {{lead.custom.not_a_field}} today.'))).rejects.toMatchObject({ code: 'VALIDATION' })

    const field = must(tables().customFields.find((row) => row.entity === 'lead' && !row.archived), 'a lead custom field')
    await expect(api.templates.create(draftInput(`Hi {{lead.name}}, your {{lead.custom.${field.key}}} is noted.`))).resolves.toMatchObject({ status: 'draft' })
  })

  it('allows at most three buttons', async () => {
    actAs(USERS.arjun)
    const button = { kind: 'quick_reply' as const, label: 'Yes' }
    await expect(api.templates.create({ ...draftInput(), buttons: [button, button, button, button] })).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(api.templates.create({ ...draftInput(), buttons: [button, { ...button, label: 'No' }, { ...button, label: 'Later' }] })).resolves.toBeDefined()
  })

  it('writes an audit log for every change, including the automatic approval', async () => {
    actAs(USERS.arjun)
    const draft = await api.templates.create(draftInput())
    await api.templates.update(draft.id, { name: 'Quote ready v2' })
    await api.templates.submitForApproval(draft.id)
    advance(REVIEW_MS)
    await api.templates.listAll()
    const copy = await api.templates.clone(draft.id)
    await api.templates.delete(copy.id)

    expect(auditFor(draft.id)).toEqual(['created', 'settings_changed', 'status_changed', 'status_changed'])
    expect(auditFor(copy.id)).toEqual(['created', 'deleted'])
    const approval = must(tables().auditLogs.filter((row) => row.entityId === draft.id).at(-1), 'approval audit row')
    expect(approval.newValue).toMatchObject({ status: 'approved' })
  })

  it('only workspace admins can change templates', async () => {
    actAs(USERS.ananya)
    await expect(api.templates.create(draftInput())).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})
