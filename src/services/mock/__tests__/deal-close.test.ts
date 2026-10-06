import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'

beforeEach(() => {
  setupMock()
  actAs(USERS.arjun)
})
afterEach(teardownMock)

describe('closing a deal', () => {
  it('won updates the lead, creates a customer once, and writes activity and audit', async () => {
    const stages = tables().stages.filter((stage) => stage.tenantId === ACME_TENANT_ID)
    const deal = tables().deals.find((item) => {
      const stage = stages.find((row) => row.id === item.stageId)
      const lead = tables().leads.find((row) => row.id === item.leadId)
      return item.tenantId === ACME_TENANT_ID && stage?.type === 'open' && lead && !lead.convertedToCustomerId
    })!
    const won = stages.find((stage) => stage.id !== deal.stageId && stage.pipelineId === deal.pipelineId && stage.type === 'won')!
    const before = tables().customers.length
    const closed = await api.deals.moveStage(deal.id, {
      stageId: won.id,
      finalValue: 125_000,
      closedAt: '2026-10-01T00:00:00.000Z',
    })
    expect(closed.value).toBe(125_000)
    expect(closed.closedAt).toBe('2026-10-01T00:00:00.000Z')
    expect(closed.customerId).toBeTruthy()
    expect(tables().customers.length).toBe(before + 1)
    const lead = tables().leads.find((item) => item.id === deal.leadId)!
    expect(tables().leadStatuses.find((status) => status.id === lead.statusId)?.type).toBe('won')
    expect(lead.convertedToCustomerId).toBe(closed.customerId)
    await api.deals.moveStage(closed.id, { stageId: won.id, position: closed.position })
    expect(tables().customers.filter((customer) => customer.originLeadId === lead.id)).toHaveLength(1)
    expect(tables().activities.some((item) => item.dealId === deal.id && item.type === 'stage_changed')).toBe(true)
    expect(tables().auditLogs.some((item) => item.entityId === deal.id && item.action === 'stage_moved')).toBe(true)
  })

  it('lost requires a reason and stores the competitor and note', async () => {
    const stages = tables().stages.filter((stage) => stage.tenantId === ACME_TENANT_ID)
    const deal = tables().deals.find(
      (item) => item.tenantId === ACME_TENANT_ID && stages.find((stage) => stage.id === item.stageId)?.type === 'open',
    )!
    const lost = stages.find((stage) => stage.pipelineId === deal.pipelineId && stage.type === 'lost')!
    const reason = tables().lostReasons.find((item) => item.tenantId === ACME_TENANT_ID)!
    await expect(api.deals.moveStage(deal.id, { stageId: lost.id })).rejects.toMatchObject({ code: 'VALIDATION' })
    const saved = await api.deals.moveStage(deal.id, {
      stageId: lost.id,
      lostReasonId: reason.id,
      lostCompetitor: 'Rival Co',
      lostNote: 'They renewed elsewhere',
    })
    expect(saved.lostReasonId).toBe(reason.id)
    expect(saved.lostCompetitor).toBe('Rival Co')
    const note = tables().activities.find((item) => item.dealId === deal.id && item.type === 'note')
    expect(note && note.type === 'note' ? note.data.text : '').toContain('renewed')
    const lead = tables().leads.find((item) => item.id === deal.leadId)!
    expect(tables().leadStatuses.find((status) => status.id === lead.statusId)?.type).not.toBe('lost')
  })

  it('weights open deals across both pipelines', async () => {
    const summary = await api.deals.getSummary()
    const stages = tables().stages.filter((stage) => stage.tenantId === ACME_TENANT_ID && stage.type === 'open')
    expect(stages.some((stage) => stage.name === 'Discovery')).toBe(true)
    expect(summary.count).toBeGreaterThan(0)
    expect(summary.weighted).toBeGreaterThan(0)
    expect(summary.weighted).toBeLessThanOrEqual(summary.total)
  })
})
