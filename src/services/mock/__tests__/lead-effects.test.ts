import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import type { Lead, LeadStatus } from '@/types'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'

beforeEach(() => {
  setupMock()
  actAs(USERS.arjun)
})
afterEach(teardownMock)

const sourceId = () => tables().leadSources.find((s) => s.tenantId === ACME_TENANT_ID)!.id
const statusOfType = (type: LeadStatus['type']) =>
  tables().leadStatuses.find((s) => s.tenantId === ACME_TENANT_ID && s.type === type)!

const activitiesOf = (leadId: string) =>
  tables().activities.filter((a) => a.tenantId === ACME_TENANT_ID && a.leadId === leadId)

function plainLead(overrides: Partial<Lead> = {}): Lead {
  return tables().leads.find(
    (l) =>
      l.tenantId === ACME_TENANT_ID &&
      !l.archivedAt &&
      !l.duplicateOf &&
      !l.convertedToCustomerId &&
      l.assignedTo === USERS.ananya &&
      tables().leadStatuses.find((s) => s.id === l.statusId)?.type === 'open' &&
      Object.entries(overrides).every(([k, v]) => l[k as keyof Lead] === v),
  )!
}

describe('creating a lead', () => {
  it('stamps the workspace, normalizes the phone and assigns a new id', async () => {
    const lead = await api.leads.create({ name: 'Meera Joshi', phone: '98765 43210', sourceId: sourceId() })
    expect(lead.tenantId).toBe(ACME_TENANT_ID)
    expect(lead.phone).toBe('+919876543210')
    expect(tables().leads.filter((l) => l.id === lead.id)).toHaveLength(1)
    expect(await api.leads.get(lead.id)).toMatchObject({ name: 'Meera Joshi' })
  })

  it('rejects a lead with no contact method, with field errors', async () => {
    const error = await api.leads.create({ name: 'No Contact', sourceId: sourceId() }).catch((e: unknown) => e)
    expect(error).toMatchObject({ code: 'VALIDATION' })
    expect(JSON.stringify(error)).toContain('phone')
  })

  it('flags a same-phone lead as a duplicate of the original', async () => {
    const original = plainLead()
    const lead = await api.leads.create({
      name: 'Someone Else',
      phone: (original.phone as string).replace('+91', ''),
      sourceId: sourceId(),
    })
    expect(lead.duplicateOf).toBe(original.id)
    const probe = await api.leads.checkDuplicates({ phone: original.phone })
    expect(probe.some((m) => m.lead.id === original.id && m.confidence === 'high')).toBe(true)
  })

  it('does not flag an unrelated contact', async () => {
    const lead = await api.leads.create({ name: 'Unique Person', phone: '9000011111', sourceId: sourceId() })
    expect(lead.duplicateOf).toBeNull()
  })

  it('scores the lead and records the score change', async () => {
    const lead = await api.leads.create({
      name: 'High Intent',
      phone: '9000022222',
      email: 'high.intent@example.in',
      budget: 900_000,
      priority: 'urgent',
      sourceId: sourceId(),
    })
    expect(lead.score).toBeGreaterThan(0)
    expect(lead.scoreBreakdown.length).toBeGreaterThan(0)
    const change = activitiesOf(lead.id).find((a) => a.type === 'score_changed')
    expect(change).toMatchObject({ type: 'score_changed', data: { from: 0, to: lead.score } })
  })

  it('routes through assignment and writes lead_created, assigned and score_changed', async () => {
    const lead = await api.leads.create({ name: 'Routed Lead', phone: '9000033333', sourceId: sourceId() })
    expect(lead.assignedTo).not.toBeNull()
    expect(lead.assignedAt).not.toBeNull()
    const types = activitiesOf(lead.id).map((a) => a.type)
    expect(types).toEqual(expect.arrayContaining(['lead_created', 'assigned', 'score_changed']))
    const assigned = activitiesOf(lead.id).find((a) => a.type === 'assigned')
    expect(assigned).toMatchObject({ data: { toUserId: lead.assignedTo } })
    expect(tables().auditLogs.some((a) => a.entityId === lead.id && a.action === 'created')).toBe(true)
    expect(tables().notifications.some((n) => n.type === 'lead_assigned' && n.link === `/leads/${lead.id}`)).toBe(
      lead.assignedTo !== USERS.arjun,
    )
  })

  it('increments the assignee’s workload', async () => {
    const acmeUsers = () => tables().users.filter((u) => u.tenantId === ACME_TENANT_ID)
    const before = new Map(acmeUsers().map((u) => [u.id, u.workload]))
    const lead = await api.leads.create({ name: 'Load Test', phone: '9000044444', sourceId: sourceId() })
    const user = acmeUsers().find((u) => u.id === lead.assignedTo)!
    expect(user.workload).toBe((before.get(user.id) ?? 0) + 1)
  })

  it('lets a salesperson add a lead and keeps it visible to them', async () => {
    actAs(USERS.vikram)
    const lead = await api.leads.create({ name: 'Walk In', phone: '9000055555', sourceId: sourceId() })
    expect(lead.createdBy).toBe(USERS.vikram)
    await expect(api.leads.get(lead.id)).resolves.toMatchObject({ id: lead.id })
  })

  it('rejects unknown references', async () => {
    await expect(
      api.leads.create({ name: 'Bad Source', phone: '9000066666', sourceId: 'source-missing' }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})

describe('changing status', () => {
  it('writes a status_changed activity and an audit entry', async () => {
    const lead = plainLead()
    const target = tables().leadStatuses.find(
      (s) => s.tenantId === ACME_TENANT_ID && s.type === 'open' && s.id !== lead.statusId,
    )!
    const updated = await api.leads.changeStatus(lead.id, { statusId: target.id, note: 'Spoke today' })
    expect(updated.statusId).toBe(target.id)
    expect(activitiesOf(lead.id).find((a) => a.type === 'status_changed' && a.data.toStatusId === target.id)).toMatchObject({
      data: { fromStatusId: lead.statusId, lostReasonId: null },
    })
    expect(
      tables().auditLogs.some((a) => a.entityId === lead.id && a.action === 'status_changed'),
    ).toBe(true)
  })

  it('requires a lost reason to mark a lead lost', async () => {
    const lead = plainLead()
    const lost = statusOfType('lost')
    await expect(api.leads.changeStatus(lead.id, { statusId: lost.id })).rejects.toMatchObject({
      code: 'VALIDATION',
    })
    expect(tables().leads.find((l) => l.id === lead.id)?.statusId).toBe(lead.statusId)

    const reason = tables().lostReasons.find((r) => r.tenantId === ACME_TENANT_ID && r.isActive)!
    const updated = await api.leads.changeStatus(lead.id, { statusId: lost.id, lostReasonId: reason.id })
    expect(updated).toMatchObject({ statusId: lost.id, lostReasonId: reason.id })
  })

  it('refuses a status change through a plain update', async () => {
    const lead = plainLead()
    await expect(
      api.leads.update(lead.id, { statusId: statusOfType('won').id }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('reassigning writes a reassigned activity and moves the workload', async () => {
    const lead = plainLead()
    const before = (id: string) =>
      tables().users.find((u) => u.tenantId === ACME_TENANT_ID && u.id === id)!.workload
    const [fromLoad, toLoad] = [before(USERS.ananya), before(USERS.vikram)]
    await api.leads.assign(lead.id, USERS.vikram)
    expect(activitiesOf(lead.id).some((a) => a.type === 'reassigned' && a.data.toUserId === USERS.vikram)).toBe(true)
    expect(before(USERS.ananya)).toBe(fromLoad - 1)
    expect(before(USERS.vikram)).toBe(toLoad + 1)
  })
})

describe('convert and merge', () => {
  it('converting keeps the lead and links the new customer', async () => {
    const lead = plainLead()
    const { lead: converted, customer } = await api.leads.convertToCustomer(lead.id)
    expect(converted.convertedToCustomerId).toBe(customer.id)
    expect(customer.originLeadId).toBe(lead.id)
    expect(tables().leads.some((l) => l.id === lead.id && !l.archivedAt)).toBe(true)
    expect(activitiesOf(lead.id).some((a) => a.type === 'converted')).toBe(true)
    await expect(api.leads.convertToCustomer(lead.id)).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('merging archives the secondary and moves its history', async () => {
    const [primary, secondary] = tables().leads.filter(
      (l) => l.tenantId === ACME_TENANT_ID && !l.archivedAt && !l.duplicateOf && !l.convertedToCustomerId,
    )
    const moved = activitiesOf(secondary.id).length
    const before = activitiesOf(primary.id).length
    await api.leads.merge(primary.id, secondary.id)
    const archived = tables().leads.find((l) => l.id === secondary.id)!
    expect(archived.archivedAt).not.toBeNull()
    expect(archived.duplicateOf).toBe(primary.id)
    expect(activitiesOf(secondary.id)).toHaveLength(0)
    expect(activitiesOf(primary.id).length).toBeGreaterThanOrEqual(before + moved)
    const { items } = await api.leads.list({ pageSize: 200 })
    expect(items.some((l) => l.id === secondary.id)).toBe(false)
  })

  it('keep separate stops the pair being reported again', async () => {
    const original = plainLead()
    const copy = await api.leads.create({
      name: 'Same Number',
      phone: original.phone as string,
      sourceId: sourceId(),
    })
    expect(copy.duplicateOf).toBe(original.id)
    const cleared = await api.leads.keepSeparate(copy.id, original.id)
    expect(cleared.duplicateOf).toBeNull()
    const matches = await api.leads.checkDuplicates({ phone: original.phone }, copy.id)
    expect(matches.some((m) => m.lead.id === original.id)).toBe(false)
  })
})

describe('follow-ups and deals', () => {
  it('completing a follow-up records the completion and the timeline entry', async () => {
    const followUp = tables().followUps.find(
      (f) => f.tenantId === ACME_TENANT_ID && f.status === 'pending' && f.assigneeId === USERS.ananya,
    )!
    actAs(USERS.ananya)
    const done = await api.followUps.complete(followUp.id, { outcome: 'no_answer', note: 'Sent the brochure' })
    expect(done.status).toBe('done')
    expect(done.completedAt).not.toBeNull()
    expect(done.completionOutcome).toBe('no_answer')
    const lead = tables().leads.find((item) => item.id === followUp.leadId)
    expect(lead?.lastContactedAt).toBe(done.completedAt)
    const activity = activitiesOf(followUp.leadId).find(
      (item) => item.type === 'followup_completed' && item.data.followUpId === followUp.id,
    )
    expect(activity?.type === 'followup_completed' ? activity.data.note : '').toContain('No answer')
  })

  it('moving a deal sets probability, and a lost stage needs a reason', async () => {
    const stages = tables().stages.filter((s) => s.tenantId === ACME_TENANT_ID)
    const deal = tables().deals.find(
      (d) => d.tenantId === ACME_TENANT_ID && stages.find((s) => s.id === d.stageId)?.type === 'open',
    )!
    const pipelineStages = stages.filter((s) => s.pipelineId === deal.pipelineId)
    const won = pipelineStages.find((s) => s.type === 'won')!
    const lost = pipelineStages.find((s) => s.type === 'lost')!

    await expect(api.deals.moveStage(deal.id, { stageId: lost.id })).rejects.toMatchObject({ code: 'VALIDATION' })

    const reason = tables().lostReasons.find((r) => r.tenantId === ACME_TENANT_ID)!
    const lostDeal = await api.deals.moveStage(deal.id, { stageId: lost.id, lostReasonId: reason.id })
    expect(lostDeal).toMatchObject({ stageId: lost.id, lostReasonId: reason.id })
    expect(lostDeal.closedAt).not.toBeNull()

    const wonDeal = await api.deals.moveStage(deal.id, { stageId: won.id })
    expect(wonDeal.probability).toBe(100)
    expect(tables().auditLogs.some((a) => a.entityId === deal.id && a.action === 'stage_moved')).toBe(true)
  })
})
