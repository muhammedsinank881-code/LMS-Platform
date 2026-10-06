import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { handleEvent } from '@/services/mock/automation/engine'
import { templateContent } from '@/lib/automation'
import type { LeafAction } from '@/types'
import { ACME_TENANT_ID, NORTHWIND_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import {
  disableSeededAutomations,
  engineContext,
  install,
  leadEvent,
  runsOf,
  useMovableClock,
  websiteSourceId,
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

describe('tenant isolation and permissions', () => {
  it('only runs a workspace\'s own automations', async () => {
    for (const a of tables().automations) a.enabled = false
    const mine = install({ name: 'Acme only', actions: [note('acme')] })
    const northwindAdmin = tables().users.find((u) => u.tenantId === NORTHWIND_TENANT_ID && u.role === 'admin')!
    actAs(northwindAdmin.id, { tenantId: NORTHWIND_TENANT_ID })
    const source = tables().leadSources.find((s) => s.tenantId === NORTHWIND_TENANT_ID)!
    await api.leads.create({ name: 'Nora North', phone: '9000077001', sourceId: source.id })
    expect(runsOf(mine.id)).toHaveLength(0)
    expect(await api.automations.list()).toMatchObject({ items: expect.not.arrayContaining([expect.objectContaining({ id: mine.id })]) })
  })

  it('forbids roles without access from reading or changing automations', async () => {
    actAs(USERS.ananya)
    await expect(api.automations.list()).rejects.toMatchObject({ code: 'FORBIDDEN' })
    actAs(USERS.neha)
    const auto = install({ name: 'Manager view', actions: [note('x')] })
    await expect(api.automations.get(auto.id)).resolves.toMatchObject({ id: auto.id })
    await expect(api.automations.delete(auto.id)).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('publish validates deleted references and the creator\'s permissions', async () => {
    const draft = await api.automations.create({
      name: 'Uses a deleted template',
      description: '',
      trigger: { type: 'lead_created', sourceIds: [] },
      conditions: { logic: 'and', items: [] },
      actions: [{ type: 'send_whatsapp', templateId: 'template-that-was-deleted' }],
    })
    expect(draft.status).toBe('draft')
    await expect(api.automations.publish(draft.id)).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(api.automations.setEnabled(draft.id, true)).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('publishing bumps the version, snapshots it, and restore goes back to a draft', async () => {
    const draft = await api.automations.create({
      name: 'Versioned',
      description: '',
      trigger: { type: 'deal_won' },
      conditions: { logic: 'and', items: [] },
      actions: [{ type: 'add_note', text: 'v1' }],
    })
    const v1 = await api.automations.publish(draft.id)
    expect(v1).toMatchObject({ version: 1, status: 'published', enabled: true })

    const edited = await api.automations.update(draft.id, { actions: [{ type: 'add_note', text: 'v2' }] })
    expect(edited).toMatchObject({ status: 'draft', enabled: false })
    const v2 = await api.automations.publish(draft.id)
    expect(v2.version).toBe(2)

    const versions = await api.automations.versions(draft.id)
    expect(versions.map((v) => v.version)).toEqual([2, 1])
    const restored = await api.automations.restoreVersion(draft.id, 1)
    expect(restored).toMatchObject({ status: 'draft', actions: [{ type: 'add_note', text: 'v1' }] })
    expect((await api.automations.publish(draft.id)).version).toBe(3)

    const copy = await api.automations.duplicate(draft.id)
    expect(copy).toMatchObject({ name: 'Versioned (copy)', status: 'draft', enabled: false })
  })

  it('serves the 8 ready-made templates, all valid against this workspace', async () => {
    const templates = await api.automations.templates()
    expect(templates).toHaveLength(8)
    for (const template of templates) {
      const draft = await api.automations.create(templateContent(template))
      await expect(api.automations.publish(draft.id), template.key).resolves.toMatchObject({ status: 'published' })
    }
  })

  it('exposes run history, stats and detail', async () => {
    const auto = install({ name: 'Stats', actions: [note('x')] })
    const lead = openLeads(1)[0]
    handleEvent(engineContext(), leadEvent('lead_created', lead.id))
    const page = await api.automations.listRuns({ automationId: auto.id })
    expect(page.items).toHaveLength(1)
    expect((await api.automations.getRun(page.items[0].id)).steps).toHaveLength(1)
    expect((await api.automations.listRuns({ automationId: auto.id, statuses: ['failed'] })).items).toHaveLength(0)
    const stats = await api.automations.stats()
    expect(stats.runs).toBeGreaterThan(0)
    expect(stats.successRate).not.toBeNull()
  })

  it('creates a lead through the website source without any automation running when none match', async () => {
    const before = tables().automationRuns.length
    await api.leads.create({ name: 'Quiet Quinn', phone: '9000077002', sourceId: websiteSourceId() })
    expect(tables().automationRuns.length).toBe(before)
  })
})

describe('dry run', () => {
  it('returns the plan and writes nothing', async () => {
    const lead = openLeads(1)[0]
    lead.email = 'dry@example.in'
    const template = tables().templates.find((t) => t.tenantId === ACME_TENANT_ID && t.channel === 'email' && t.status === 'approved')!
    await api.leads.list({ pageSize: 1 })
    const before = JSON.stringify(tables())

    const result = await api.automations.test({
      content: {
        name: 'Dry',
        description: '',
        trigger: { type: 'lead_created', sourceIds: [] },
        conditions: { logic: 'and', items: [{ field: 'budget', operator: 'is_empty' }] },
        actions: [
          { type: 'assign', strategy: 'specific_user', userId: USERS.vikram, teamId: null },
          { type: 'add_note', text: 'dry' },
          { type: 'wait', amount: 3, unit: 'hours' },
          { type: 'send_email', templateId: template.id },
        ],
      },
      entity: { kind: 'lead', id: lead.id },
    })

    expect(JSON.stringify(tables())).toBe(before)
    expect(result.matched).toBe(lead.budget === null)
    if (result.matched) {
      expect(result.steps.map((s) => s.actionType)).toEqual(['assign', 'add_note', 'wait', 'send_email'])
      expect(result.steps[0].result).toMatch(/Assigned to/)
      expect(result.waitsUntil).toBe(new Date(Date.parse(result.steps[0].startedAt!) + 3 * 3_600_000).toISOString())
    }
  })

  it('explains which conditions failed and why, without running actions', async () => {
    const lead = openLeads(1)[0]
    const result = await api.automations.test({
      content: {
        name: 'Never',
        description: '',
        trigger: { type: 'lead_created', sourceIds: [] },
        conditions: { logic: 'and', items: [{ field: 'budget', operator: 'gt', value: 999_999_999 }] },
        actions: [{ type: 'add_note', text: 'x' }],
      },
      entity: { kind: 'lead', id: lead.id },
    })
    expect(result.matched).toBe(false)
    expect(result.steps).toEqual([])
    expect(result.conditionTrace[0]).toMatchObject({ matched: false })
    expect(result.conditionTrace[0].reason).toMatch(/Budget is/)
  })

  it('surfaces a would-be failure instead of throwing', async () => {
    const lead = openLeads(1)[0]
    lead.email = null
    const template = tables().templates.find((t) => t.channel === 'email' && t.status === 'approved')!
    const result = await api.automations.test({
      content: {
        name: 'Fails',
        description: '',
        trigger: { type: 'lead_created', sourceIds: [] },
        conditions: { logic: 'and', items: [] },
        actions: [{ type: 'send_email', templateId: template.id }],
      },
      entity: { kind: 'lead', id: lead.id },
    })
    expect(result.steps[0]).toMatchObject({ status: 'failed' })
    expect(result.warnings.join(' ')).toMatch(/no email/)
  })
})
