import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import type { Lead } from '@/types'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'

beforeEach(() => {
  setupMock()
  actAs(USERS.arjun)
})
afterEach(teardownMock)

const activitiesOf = (leadId: string) =>
  tables().activities.filter((activity) => activity.tenantId === ACME_TENANT_ID && activity.leadId === leadId)

function openLead(): Lead {
  return tables().leads.find(
    (lead) =>
      lead.tenantId === ACME_TENANT_ID &&
      !lead.archivedAt &&
      !lead.convertedToCustomerId &&
      lead.assignedTo === USERS.ananya &&
      tables().leadStatuses.find((status) => status.id === lead.statusId)?.type === 'open',
  )!
}

describe('lead detail actions', () => {
  it('converts to a customer, keeps the history, and blocks a second conversion', async () => {
    const lead = openLead()
    const before = activitiesOf(lead.id).length
    const pipeline = tables().pipelines.find((item) => item.tenantId === ACME_TENANT_ID)!
    const stage = tables().stages.find((item) => item.pipelineId === pipeline.id && item.type === 'open')!
    const won = tables().leadStatuses.find((item) => item.tenantId === ACME_TENANT_ID && item.type === 'won')!
    const result = await api.leads.convertToCustomer(lead.id, {
      name: 'Renamed Customer',
      companyName: 'Northwind Traders',
      statusId: won.id,
      deal: {
        title: 'Northwind opportunity',
        value: 180_000,
        expectedCloseDate: '2026-12-01',
        product: 'CRM',
        ownerId: USERS.ananya,
        pipelineId: pipeline.id,
        stageId: stage.id,
      },
    })

    expect(result.customer.name).toBe('Renamed Customer')
    expect(result.customer.originLeadId).toBe(lead.id)
    expect(result.company?.name).toBe('Northwind Traders')
    expect(result.deal?.leadId).toBe(lead.id)
    expect(result.lead.convertedToCustomerId).toBe(result.customer.id)
    expect(result.lead.statusId).toBe(won.id)
    expect(activitiesOf(lead.id).length).toBeGreaterThan(before)
    expect(activitiesOf(lead.id).some((activity) => activity.type === 'converted')).toBe(true)
    await expect(api.leads.get(lead.id)).resolves.toMatchObject({ name: lead.name })
    await expect(api.leads.convertToCustomer(lead.id)).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('lets only the author edit, pin and delete a note', async () => {
    const lead = openLead()
    const note = await api.leads.addActivity(lead.id, { type: 'note', data: { text: 'Hello' } })
    expect((await api.leads.get(lead.id)).lastContactedAt).not.toBeNull()
    const pinned = await api.leads.setNotePinned(lead.id, note.id, true)
    expect(pinned.type === 'note' && pinned.data.pinned).toBe(true)
    expect((await api.leads.listPinnedNotes(lead.id)).some((item) => item.id === note.id)).toBe(true)

    actAs(USERS.ananya)
    await expect(api.leads.updateNote(lead.id, note.id, { text: 'Nope' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })

    actAs(USERS.arjun)
    const edited = await api.leads.updateNote(lead.id, note.id, { text: 'Edited note' })
    expect(edited.type === 'note' && edited.data.text).toBe('Edited note')
    await api.leads.deleteNote(lead.id, note.id)
    expect((await api.leads.listPinnedNotes(lead.id)).some((item) => item.id === note.id)).toBe(false)
  })

  it('saves qualification onto the lead and the timeline', async () => {
    const lead = openLead()
    const question = tables().qualificationQuestions.find((item) => item.tenantId === ACME_TENANT_ID)!
    const saved = await api.leads.saveQualification(lead.id, {
      qualificationStatus: 'qualified',
      qualificationAnswers: { [question.id]: true },
      notes: 'Budget confirmed',
    })
    expect(saved.qualificationStatus).toBe('qualified')
    expect(saved.qualificationAnswers[question.id]).toBe(true)
    expect(
      activitiesOf(lead.id).some(
        (activity) => activity.type === 'note' && activity.data.text.includes('Qualified') && activity.data.text.includes('Budget confirmed'),
      ),
    ).toBe(true)
  })

  it('lists a merged lead under merged-from', async () => {
    const [primary, secondary] = tables().leads.filter(
      (lead) => lead.tenantId === ACME_TENANT_ID && !lead.archivedAt && !lead.duplicateOf && !lead.convertedToCustomerId,
    )
    await api.leads.merge(primary.id, secondary.id)
    const relations = await api.leads.getRelations(primary.id)
    expect(relations.mergedFrom.some((lead) => lead.id === secondary.id)).toBe(true)
  })
})
