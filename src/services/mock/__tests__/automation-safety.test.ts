import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { handleEvent } from '@/services/mock/automation/engine'
import { MAX_CHAIN_DEPTH, RATE_LIMIT_PER_HOUR } from '@/lib/automation'
import type { AutomationAction, LeafAction } from '@/types'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import {
  disableSeededAutomations,
  engineContext,
  install,
  leadEvent,
  runsOf,
  useMovableClock,
} from './automation-fixtures'

beforeEach(() => {
  setupMock()
  useMovableClock()
  actAs(USERS.arjun)
  disableSeededAutomations()
})
afterEach(teardownMock)

const openLeads = (n: number) =>
  tables()
    .leads.filter(
      (l) =>
        l.tenantId === ACME_TENANT_ID &&
        !l.archivedAt &&
        tables().leadStatuses.find((s) => s.id === l.statusId)?.type === 'open',
    )
    .slice(0, n)

const note = (text: string): LeafAction => ({ type: 'add_note', text })

describe('loop prevention and chain depth', () => {
  it('stops an automation from re-triggering itself within one causal chain', async () => {
    const auto = install({
      name: 'Self trigger',
      trigger: { type: 'lead_updated', field: 'budget' },
      actions: [{ type: 'set_field', field: 'budget', value: 5 }],
    })
    const lead = openLeads(1)[0]
    await api.leads.update(lead.id, { budget: 123_456 })

    const runs = runsOf(auto.id).filter((r) => r.entity.id === lead.id)
    expect(runs.map((r) => r.status).sort()).toEqual(['skipped', 'succeeded'])
    expect(runs.find((r) => r.status === 'skipped')?.error).toMatch(/loop/i)
    expect(tables().leads.find((l) => l.id === lead.id)!.budget).toBe(5)
  })

  it(`stops a chain deeper than ${MAX_CHAIN_DEPTH}`, async () => {
    const steps: Array<[string, string, string, string | number]> = [
      ['budget', 'priority', 'priority', 'high'],
      ['priority', 'language', 'language', 'Hindi'],
      ['language', 'location', 'location', 'Pune'],
      ['location', 'productInterest', 'productInterest', 'SEO'],
      ['productInterest', 'requirement', 'requirement', 'Needs SEO'],
      ['requirement', 'leadType', 'leadType', 'b2b'],
      ['leadType', 'budget', 'budget', 7],
    ]
    const autos = steps.map(([from, , field, value], i) =>
      install({
        name: `Chain ${i}`,
        trigger: { type: 'lead_updated', field: from as 'budget' },
        actions: [{ type: 'set_field', field, value }],
      }),
    )
    const lead = openLeads(1)[0]
    await api.leads.update(lead.id, { budget: 99_999 })

    const statusOf = (i: number) => runsOf(autos[i].id).find((r) => r.entity.id === lead.id)?.status
    expect([0, 1, 2, 3, 4, 5].map(statusOf)).toEqual(Array(6).fill('succeeded'))
    expect(statusOf(6)).toBe('skipped')
    expect(runsOf(autos[6].id)[0].error).toMatch(/maximum depth/)
  })
})

describe('idempotency and rate limiting', () => {
  it('does not run twice for the same (automation, entity, event)', () => {
    const auto = install({ name: 'Once', actions: [note('hello')] })
    const lead = openLeads(1)[0]
    const event = leadEvent('lead_created', lead.id, { sourceId: lead.sourceId }, 'evt-fixed')
    handleEvent(engineContext(), event)
    handleEvent(engineContext(), event)
    expect(runsOf(auto.id)).toHaveLength(1)
    handleEvent(engineContext(), leadEvent('lead_created', lead.id, { sourceId: lead.sourceId }, 'evt-other'))
    expect(runsOf(auto.id)).toHaveLength(2)
  })

  it(`allows ${RATE_LIMIT_PER_HOUR} runs per entity per hour, then skips`, () => {
    const auto = install({ name: 'Busy', trigger: { type: 'lead_updated', field: 'budget' }, actions: [note('x')] })
    const lead = openLeads(1)[0]
    for (let i = 0; i < RATE_LIMIT_PER_HOUR + 2; i++) {
      handleEvent(engineContext(), leadEvent('lead_updated', lead.id, { changedFields: ['budget'] }))
    }
    const runs = runsOf(auto.id)
    expect(runs.filter((r) => r.status === 'succeeded')).toHaveLength(RATE_LIMIT_PER_HOUR)
    const skipped = runs.filter((r) => r.status === 'skipped')
    expect(skipped).toHaveLength(2)
    expect(skipped[0].error).toMatch(/too many runs/)
  })

  it('only counts conditions that match: a mismatch writes nothing', () => {
    const auto = install({
      name: 'Picky',
      conditions: { logic: 'and', items: [{ field: 'budget', operator: 'gt', value: 999_999_999 }] },
      actions: [note('x')],
    })
    const lead = openLeads(1)[0]
    handleEvent(engineContext(), leadEvent('lead_created', lead.id, { sourceId: lead.sourceId }))
    expect(runsOf(auto.id)).toHaveLength(0)
  })
})

describe('failure handling', () => {
  const failing: AutomationAction[] = [
    { type: 'change_status', statusId: '' },
  ]

  function failingAutomation() {
    const lost = tables().leadStatuses.find((s) => s.tenantId === ACME_TENANT_ID && s.type === 'lost')!
    return install({ name: 'Always fails', actions: [{ ...failing[0], type: 'change_status', statusId: lost.id }] })
  }

  it('records the failed step and error, and notifies the owner and admins', () => {
    const auto = failingAutomation()
    const lead = openLeads(1)[0]
    handleEvent(engineContext(), leadEvent('lead_created', lead.id, { sourceId: lead.sourceId }))
    const [run] = runsOf(auto.id)
    expect(run.status).toBe('failed')
    expect(run.error).toMatch(/reason/i)
    expect(run.steps[0]).toMatchObject({ status: 'failed', actionType: 'change_status' })
    const recipients = tables().notifications.filter((n) => n.type === 'automation_failed').map((n) => n.userId)
    expect(recipients).toEqual(expect.arrayContaining([USERS.arjun, USERS.priya]))
  })

  it('disables the automation after repeated consecutive failures and tells the owner', () => {
    const auto = failingAutomation()
    for (const lead of openLeads(5)) {
      handleEvent(engineContext(), leadEvent('lead_created', lead.id, { sourceId: lead.sourceId }))
    }
    const saved = tables().automations.find((a) => a.id === auto.id)!
    expect(saved).toMatchObject({ enabled: false, consecutiveFailures: 5, errorCount: 5 })
    const paused = tables().notifications.filter((n) => n.type === 'automation_failed' && n.title.startsWith('Automation paused'))
    expect(paused.map((n) => n.userId)).toContain(USERS.arjun)
    expect(tables().auditLogs.some((l) => l.automationId === auto.id && l.newValue?.enabled === false)).toBe(true)

    // A sixth event no longer runs it.
    handleEvent(engineContext(), leadEvent('lead_created', openLeads(6)[5].id))
    expect(runsOf(auto.id)).toHaveLength(5)
  })

  it('a success resets the failure streak', () => {
    const auto = install({ name: 'Flaky', actions: [{ type: 'send_email', templateId: tables().templates.find((t) => t.channel === 'email' && t.status === 'approved')!.id }] })
    const [noEmail, withEmail] = openLeads(2)
    noEmail.email = null
    withEmail.email = 'ok@example.in'
    handleEvent(engineContext(), leadEvent('lead_created', noEmail.id))
    expect(tables().automations.find((a) => a.id === auto.id)!.consecutiveFailures).toBe(1)
    handleEvent(engineContext(), leadEvent('lead_created', withEmail.id))
    expect(tables().automations.find((a) => a.id === auto.id)!.consecutiveFailures).toBe(0)
  })

  it('retries a failed run from the failed step', async () => {
    const template = tables().templates.find((t) => t.channel === 'email' && t.status === 'approved')!
    const auto = install({ name: 'Retry me', actions: [note('first'), { type: 'send_email', templateId: template.id }] })
    const lead = openLeads(1)[0]
    lead.email = null
    handleEvent(engineContext(), leadEvent('lead_created', lead.id))
    const [failed] = runsOf(auto.id)
    expect(failed.status).toBe('failed')

    lead.email = 'now.has@example.in'
    const retried = await api.automations.retryRun(failed.id)
    expect(retried.status).toBe('succeeded')
    expect(retried.steps.map((s) => s.status)).toEqual(['succeeded', 'succeeded'])
    await expect(api.automations.retryRun(failed.id)).rejects.toMatchObject({ code: 'CONFLICT' })
  })
})

describe('branches', () => {
  it('runs the side whose condition matches and records the choice', () => {
    const auto = install({
      name: 'Branchy',
      actions: [
        {
          type: 'branch',
          conditions: { logic: 'and', items: [{ field: 'budget', operator: 'gt', value: 100_000 }] },
          then: [note('big budget')],
          else: [note('small budget')],
        },
      ],
    })
    const [big, small] = openLeads(2)
    big.budget = 500_000
    small.budget = 10
    handleEvent(engineContext(), leadEvent('lead_created', big.id))
    handleEvent(engineContext(), leadEvent('lead_created', small.id))
    const [r1, r2] = runsOf(auto.id)
    expect(r1.steps.map((s) => s.path)).toEqual(['0', '0.then.0'])
    expect(r2.steps.map((s) => s.path)).toEqual(['0', '0.else.0'])
  })
})
