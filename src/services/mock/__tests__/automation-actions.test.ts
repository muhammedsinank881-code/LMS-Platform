import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { executeAction } from '@/services/mock/automation/executors'
import { systemContext } from '@/services/mock/automation/system-context'
import type { Automation, Lead, LeafAction } from '@/types'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import { engineContext, install, useMovableClock, websiteSourceId } from './automation-fixtures'

let automation: Automation
let lead: Lead

beforeEach(async () => {
  setupMock()
  useMovableClock()
  actAs(USERS.arjun)
  for (const a of tables().automations) a.enabled = false
  automation = install({ name: 'Action tester' })
  lead = await api.leads.create({
    name: 'Action Target',
    phone: '9000088001',
    email: 'action.target@example.in',
    sourceId: websiteSourceId(),
    assignedTo: USERS.ananya,
  })
})
afterEach(teardownMock)

function run(action: LeafAction, dealId: string | null = null): string {
  const base = engineContext()
  const sys = systemContext(base, automation, { chainId: 'c', depth: 0, causedBy: [] })
  return executeAction(sys, action, { leadId: lead.id, dealId }, automation)
}

const current = () => tables().leads.find((l) => l.id === lead.id)!
const automationAudits = () => tables().auditLogs.filter((l) => l.automationId === automation.id)
const automationActivities = () => tables().activities.filter((a) => a.automation?.id === automation.id)

describe('action executors write through the same paths as the UI, as the automation', () => {
  it('assign: specific user, round-robin and rules', () => {
    run({ type: 'assign', strategy: 'specific_user', userId: USERS.vikram, teamId: null })
    expect(current().assignedTo).toBe(USERS.vikram)
    expect(automationActivities().some((a) => a.type === 'reassigned')).toBe(true)
    expect(automationAudits().some((l) => l.action === 'assigned')).toBe(true)

    const text = run({ type: 'assign', strategy: 'round_robin', userId: null, teamId: null })
    expect(text).toMatch(/Assigned to|Already assigned/)
    expect(current().assignedTo).toBeTruthy()
    expect(() => run({ type: 'assign', strategy: 'specific_user', userId: null, teamId: null })).toThrow(/No user/)
  })

  it('change_status writes the status activity and audit', () => {
    const target = tables().leadStatuses.find((s) => s.tenantId === ACME_TENANT_ID && s.type === 'open' && s.id !== current().statusId)!
    run({ type: 'change_status', statusId: target.id })
    expect(current().statusId).toBe(target.id)
    expect(automationActivities().some((a) => a.type === 'status_changed')).toBe(true)
    expect(automationAudits().some((l) => l.action === 'status_changed')).toBe(true)
  })

  it('change_status to a lost status fails like the manual path (a reason is required)', () => {
    const lost = tables().leadStatuses.find((s) => s.tenantId === ACME_TENANT_ID && s.type === 'lost')!
    expect(() => run({ type: 'change_status', statusId: lost.id })).toThrow()
  })

  it('add_tags and remove_tags', () => {
    run({ type: 'add_tags', tags: ['VIP', 'Referral'] })
    expect(current().tags).toEqual(expect.arrayContaining(['VIP', 'Referral']))
    expect(run({ type: 'add_tags', tags: ['VIP'] })).toMatch(/already/i)
    run({ type: 'remove_tags', tags: ['VIP'] })
    expect(current().tags).not.toContain('VIP')
    expect(automationAudits().some((l) => l.action === 'updated')).toBe(true)
  })

  it('set_field updates a lead field and a custom field, and rejects the rest', () => {
    run({ type: 'set_field', field: 'priority', value: 'urgent' })
    expect(current().priority).toBe('urgent')
    run({ type: 'set_field', field: 'budget', value: '750000' })
    expect(current().budget).toBe(750000)
    const custom = tables().customFields.find((f) => f.tenantId === ACME_TENANT_ID && f.entity === 'lead')!
    run({ type: 'set_field', field: `custom.${custom.key}`, value: 'x' })
    expect(current().customFields[custom.key]).toBe('x')
    expect(() => run({ type: 'set_field', field: 'name', value: 'Hacked' })).toThrow(/cannot be set/)
    expect(() => run({ type: 'set_field', field: 'custom.nope', value: 1 })).toThrow(/does not exist/)
  })

  it('create_followup and create_task', () => {
    run({ type: 'create_followup', followUpType: 'call', dueInHours: 2, priority: 'high' })
    const followUp = tables().followUps.find((f) => f.leadId === lead.id && f.notes.includes('Action tester'))!
    expect(followUp.assigneeId).toBe(USERS.ananya)
    expect(Date.parse(followUp.dueAt) - clockNow()).toBe(2 * 3_600_000)
    expect(automationActivities().some((a) => a.type === 'followup_scheduled')).toBe(true)

    run({ type: 'create_task', title: 'Prepare quote for {{lead.name}}', dueInHours: 24, priority: 'medium' })
    expect(tables().tasks.some((t) => t.leadId === lead.id && t.title === 'Prepare quote for Action Target')).toBe(true)
    expect(automationAudits().some((l) => l.entity === 'task')).toBe(true)
  })

  it('send_whatsapp and send_email send approved templates to the lead', () => {
    const wa = tables().templates.find((t) => t.tenantId === ACME_TENANT_ID && t.channel === 'whatsapp' && t.status === 'approved')!
    const em = tables().templates.find((t) => t.tenantId === ACME_TENANT_ID && t.channel === 'email' && t.status === 'approved')!
    run({ type: 'send_whatsapp', templateId: wa.id })
    run({ type: 'send_email', templateId: em.id })
    const sent = tables().messages.filter(
      (m) => m.direction === 'outbound' && tables().conversations.find((c) => c.id === m.conversationId)?.leadId === lead.id,
    )
    expect(sent.map((m) => m.channel).sort()).toEqual(['email', 'whatsapp'])
    expect(() => run({ type: 'send_whatsapp', templateId: 'gone' })).toThrow(/no longer exists/)
    current().email = null
    expect(() => run({ type: 'send_email', templateId: em.id })).toThrow(/no email/)
  })

  it('notify_user and notify_team create in-app notifications', () => {
    run({ type: 'notify_user', userId: 'assignee', message: 'Look at {{lead.name}}' })
    const note = tables().notifications.find((n) => n.userId === USERS.ananya && n.type === 'automation_alert')!
    expect(note.body).toBe('Look at Action Target')
    expect(note.link).toContain(`/leads/${lead.id}`)
    run({ type: 'notify_team', target: 'manager', teamId: null, message: 'FYI' })
    expect(tables().notifications.some((n) => n.userId === USERS.neha && n.body === 'FYI')).toBe(true)
    run({ type: 'notify_team', target: 'team', teamId: null, message: 'Team news' })
    expect(tables().notifications.some((n) => n.userId === USERS.vikram && n.body === 'Team news')).toBe(true)
  })

  it('add_note and call_webhook', () => {
    run({ type: 'add_note', text: 'Auto note for {{lead.name}}' })
    expect(tables().activities.some((a) => a.leadId === lead.id && a.type === 'note' && a.automation?.id === automation.id && a.data.text === 'Auto note for Action Target')).toBe(true)
    expect(() => run({ type: 'call_webhook', endpointId: 'missing' })).toThrow(/no longer exists/)
  })

  it('create_customer converts once and is idempotent', () => {
    run({ type: 'create_customer' })
    const customerId = current().convertedToCustomerId
    expect(customerId).toBeTruthy()
    expect(tables().customers.some((c) => c.id === customerId && c.originLeadId === lead.id)).toBe(true)
    expect(run({ type: 'create_customer' })).toMatch(/already a customer/)
  })

  it('create_deal and move_deal_stage', () => {
    const stages = tables().stages.filter((s) => s.tenantId === ACME_TENANT_ID && s.type === 'open').sort((a, b) => a.order - b.order)
    const [first, second] = stages.filter((s) => s.pipelineId === stages[0].pipelineId)
    run({ type: 'create_deal', title: 'Deal for {{lead.name}}', pipelineId: first.pipelineId, stageId: first.id, value: 50_000 })
    const deal = tables().deals.find((d) => d.leadId === lead.id && d.title === 'Deal for Action Target')!
    expect(deal.value).toBe(50_000)
    expect(automationAudits().some((l) => l.entity === 'deal' && l.action === 'created')).toBe(true)

    run({ type: 'move_deal_stage', stageId: second.id }, deal.id)
    expect(tables().deals.find((d) => d.id === deal.id)!.stageId).toBe(second.id)
    expect(automationAudits().some((l) => l.action === 'stage_moved')).toBe(true)
    expect(() => run({ type: 'move_deal_stage', stageId: second.id })).toThrow(/needs a deal/)
  })
})

function clockNow(): number {
  return engineContext().now.getTime()
}
