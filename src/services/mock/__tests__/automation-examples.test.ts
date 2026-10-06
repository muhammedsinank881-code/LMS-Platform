import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import {
  advanceHours,
  disableSeededAutomations,
  facebookSourceId,
  install,
  runsOf,
  useMovableClock,
  websiteSourceId,
} from './automation-fixtures'

beforeEach(() => {
  setupMock()
  useMovableClock()
  actAs(USERS.arjun)
})
afterEach(teardownMock)

const seeded = (name: string) => tables().automations.find((a) => a.tenantId === ACME_TENANT_ID && a.name.startsWith(name))!

function only(name: string): string {
  disableSeededAutomations()
  const automation = seeded(name)
  automation.enabled = true
  return automation.id
}

describe('spec example 1: a new Facebook lead', () => {
  it('assigns, messages, schedules a follow-up and notifies the manager, as the automation', async () => {
    const id = only('New Facebook lead')
    const runsBefore = seeded('New Facebook lead').runCount
    const lead = await api.leads.create({
      name: 'Fiona Facebook',
      phone: '9000099001',
      email: 'fiona@example.in',
      sourceId: facebookSourceId(),
    })

    const [run] = runsOf(id).filter((r) => r.entity.id === lead.id)
    expect(run.status, JSON.stringify(run.steps)).toBe('succeeded')
    expect(run.steps.map((s) => s.actionType)).toEqual(['assign', 'send_whatsapp', 'create_followup', 'notify_team'])

    const saved = tables().leads.find((l) => l.id === lead.id)!
    expect(saved.assignedTo).toBeTruthy()
    expect(tables().messages.some((m) => m.direction === 'outbound' && m.templateId && tables().conversations.find((c) => c.id === m.conversationId)?.leadId === lead.id)).toBe(true)
    expect(tables().followUps.some((f) => f.leadId === lead.id && f.notes.startsWith('Created by'))).toBe(true)

    const attributed = tables().activities.filter((a) => a.leadId === lead.id && a.automation?.id === id)
    expect(attributed.length).toBeGreaterThan(0)
    expect(attributed.every((a) => a.actorId === null && a.automation?.name.startsWith('New Facebook lead'))).toBe(true)

    const audits = tables().auditLogs.filter((l) => l.automationId === id)
    expect(audits.length).toBeGreaterThan(0)
    expect(audits.every((l) => l.actorType === 'system' && l.actorLabel?.startsWith('Automation: '))).toBe(true)

    expect(tables().notifications.some((n) => n.type === 'automation_alert' && n.userId === USERS.neha)).toBe(true)
    expect(tables().automations.find((a) => a.id === id)).toMatchObject({ runCount: runsBefore + 1 })
  })

  it('does not run for other sources', async () => {
    const id = only('New Facebook lead')
    const lead = await api.leads.create({ name: 'Wendy Web', phone: '9000099002', sourceId: websiteSourceId() })
    expect(runsOf(id).filter((r) => r.entity.id === lead.id)).toHaveLength(0)
  })
})

describe('spec example 2: a won deal starts onboarding', () => {
  it('creates the customer, sends WhatsApp and email, and creates the kickoff task', async () => {
    const id = only('Won deal')
    const deal = tables().deals.find((d) => {
      const stage = tables().stages.find((s) => s.id === d.stageId)
      const lead = tables().leads.find((l) => l.id === d.leadId)
      return d.tenantId === ACME_TENANT_ID && stage?.type === 'open' && lead && !lead.convertedToCustomerId
    })!
    const lead = tables().leads.find((l) => l.id === deal.leadId)!
    lead.email = 'won.customer@example.in'
    lead.phone = '+919000099003'
    lead.whatsapp = '+919000099003'
    const won = tables().stages.find((s) => s.pipelineId === deal.pipelineId && s.type === 'won')!

    await api.deals.moveStage(deal.id, { stageId: won.id })

    const [run] = runsOf(id)
    expect(run.status, JSON.stringify(run.steps)).toBe('succeeded')
    expect(tables().leads.find((l) => l.id === lead.id)!.convertedToCustomerId).toBeTruthy()
    const channels = tables()
      .messages.filter((m) => tables().conversations.find((c) => c.id === m.conversationId)?.leadId === lead.id && m.direction === 'outbound')
      .map((m) => m.channel)
    expect(channels).toEqual(expect.arrayContaining(['whatsapp', 'email']))
    expect(tables().tasks.some((t) => t.leadId === lead.id && t.title.startsWith('Kick off onboarding'))).toBe(true)
  })
})

describe('spec example 3: no contact in 2 hours', () => {
  it('notifies the owner and the manager once the lead has been idle for 2 hours', async () => {
    const id = only('No contact in 2 hours')
    const lead = await api.leads.create({ name: 'Idle Ivan', phone: '9000099004', sourceId: websiteSourceId() })
    expect(runsOf(id).filter((r) => r.entity.id === lead.id)).toHaveLength(0)

    advanceHours(1)
    await api.leads.list({ pageSize: 1 })
    expect(runsOf(id).filter((r) => r.entity.id === lead.id)).toHaveLength(0)

    advanceHours(2)
    await api.leads.list({ pageSize: 1 })
    const [run] = runsOf(id).filter((r) => r.entity.id === lead.id)
    expect(run.status, JSON.stringify(run.steps)).toBe('succeeded')
    const owner = tables().leads.find((l) => l.id === lead.id)!.assignedTo
    expect(tables().notifications.some((n) => n.type === 'automation_alert' && n.userId === owner)).toBe(true)
    expect(tables().notifications.some((n) => n.type === 'automation_alert' && n.userId === USERS.neha)).toBe(true)

    advanceHours(5)
    await api.leads.list({ pageSize: 1 })
    expect(runsOf(id).filter((r) => r.entity.id === lead.id)).toHaveLength(1)
  })
})

describe('delays and the simulated clock', () => {
  const content = {
    name: 'Delayed note',
    actions: [
      { type: 'wait', amount: 2, unit: 'hours' },
      { type: 'add_note', text: 'after the wait' },
    ],
  } as const

  it('stores a waiting run with resumeAt and resumes it when the clock passes it', async () => {
    disableSeededAutomations()
    const automation = install({ ...content, actions: [...content.actions] })
    const lead = await api.leads.create({ name: 'Wait Wanda', phone: '9000099005', sourceId: websiteSourceId() })
    const [run] = runsOf(automation.id)
    expect(run).toMatchObject({ status: 'waiting', cursor: 1, entity: { id: lead.id } })
    expect(Date.parse(run.resumeAt!)).toBe(Date.parse(run.startedAt) + 2 * 3_600_000)

    advanceHours(1)
    await api.leads.list({ pageSize: 1 })
    expect(runsOf(automation.id)[0].status).toBe('waiting')

    advanceHours(1.5)
    await api.leads.list({ pageSize: 1 })
    const resumed = runsOf(automation.id)[0]
    expect(resumed.status).toBe('succeeded')
    expect(resumed.steps.map((s) => s.status)).toEqual(['succeeded', 'succeeded'])
    expect(tables().activities.some((a) => a.leadId === lead.id && a.type === 'note' && a.automation?.id === automation.id)).toBe(true)
  })

  it('cancels a waiting run so it never resumes', async () => {
    disableSeededAutomations()
    const automation = install({ ...content, actions: [...content.actions] })
    const lead = await api.leads.create({ name: 'Cancel Carl', phone: '9000099006', sourceId: websiteSourceId() })
    const [run] = runsOf(automation.id)
    const cancelled = await api.automations.cancelRun(run.id)
    expect(cancelled.status).toBe('cancelled')
    expect(cancelled.resumeAt).toBeNull()

    advanceHours(5)
    await api.leads.list({ pageSize: 1 })
    expect(runsOf(automation.id)[0].status).toBe('cancelled')
    expect(tables().activities.some((a) => a.leadId === lead.id && a.automation?.id === automation.id)).toBe(false)
    await expect(api.automations.cancelRun(run.id)).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('cancels a waiting run when its automation was turned off meanwhile', async () => {
    disableSeededAutomations()
    const automation = install({ ...content, actions: [...content.actions] })
    await api.leads.create({ name: 'Off Olga', phone: '9000099007', sourceId: websiteSourceId() })
    tables().automations.find((a) => a.id === automation.id)!.enabled = false
    advanceHours(3)
    await api.leads.list({ pageSize: 1 })
    expect(runsOf(automation.id)[0].status).toBe('cancelled')
  })
})
