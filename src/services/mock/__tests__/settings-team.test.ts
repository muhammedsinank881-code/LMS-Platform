import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services'
import { DEFAULT_PERMISSION_MATRIX } from '@/lib/permissions'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'

beforeEach(() => {
  setupMock()
  actAs(USERS.arjun)
})

describe('settings and team guards', () => {
  it('follows a saved matrix in the mock backend', async () => {
    const current = await api.settings.permissions.get()
    await api.settings.permissions.update({
      matrix: {
        ...current.matrix,
        salesperson: {
          ...current.matrix.salesperson,
          leads: { scope: 'own', actions: ['view'] },
        },
      },
      sectionGrants: current.sectionGrants,
    })
    actAs(USERS.ananya)
    await expect(api.leads.list()).resolves.toBeTruthy()
    await expect(api.leads.create({ name: 'Blocked', phone: '9000099999', sourceId: tables().leadSources[0]?.id ?? '' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
    expect(DEFAULT_PERMISSION_MATRIX.salesperson.leads.actions).toContain('create')
  })

  it('blocks self-deactivation and the last admin', async () => {
    await expect(api.team.deactivateMember(USERS.arjun, { mode: 'rules' })).rejects.toMatchObject({ code: 'VALIDATION' })
    actAs(USERS.priya)
    await api.team.updateMember(USERS.arjun, { role: 'manager' })
    await expect(api.team.updateMember(USERS.priya, { role: 'manager' })).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('reassigns open leads when a member is deactivated', async () => {
    const openIds = new Set(
      tables()
        .leadStatuses.filter((status) => status.tenantId === ACME_TENANT_ID && status.type === 'open')
        .map((status) => status.id),
    )
    const lead = tables().leads.find(
      (item) => item.tenantId === ACME_TENANT_ID && item.assignedTo === USERS.ananya && !item.archivedAt && openIds.has(item.statusId),
    )
    expect(lead).toBeTruthy()
    await api.team.deactivateMember(USERS.ananya, { mode: 'user', userId: USERS.vikram })
    const moved = tables().leads.find((item) => item.id === lead?.id)
    expect(moved?.assignedTo).toBe(USERS.vikram)
    expect(tables().users.find((user) => user.id === USERS.ananya)?.status).toBe('inactive')
  })

  it('refuses to delete the last won status and reassigns when a replacement is given', async () => {
    const statuses = tables().leadStatuses.filter((status) => status.tenantId === ACME_TENANT_ID)
    const won = statuses.find((status) => status.type === 'won')
    await expect(api.statuses.delete(won?.id ?? '')).rejects.toMatchObject({ code: 'CONFLICT' })
    const open = statuses.find((status) => status.type === 'open' && (status.usageCount ?? 0) >= 0)
    const used = tables().leads.find((lead) => lead.statusId === open?.id)
    if (open && used) {
      const other = statuses.find((status) => status.id !== open.id && status.type === 'open')
      await api.statuses.delete(open.id, { replacementId: other?.id })
      expect(tables().leads.find((lead) => lead.id === used.id)?.statusId).toBe(other?.id)
    }
  })

  it('archives a custom field that has values instead of deleting it', async () => {
    const field = tables().customFields.find((item) => item.tenantId === ACME_TENANT_ID && item.entity === 'lead')
    const lead = tables().leads.find((item) => item.tenantId === ACME_TENANT_ID)
    if (field && lead) {
      lead.customFields = { ...lead.customFields, [field.key]: 'kept' }
      await expect(api.settings.customFields.delete(field.id)).rejects.toMatchObject({ code: 'CONFLICT' })
      const archived = await api.settings.customFields.update(field.id, { archived: true })
      expect(archived.archived).toBe(true)
      expect(tables().leads.find((item) => item.id === lead.id)?.customFields[field.key]).toBe('kept')
    }
  })

  it('writes previous and new values when a status is renamed', async () => {
    const status = tables().leadStatuses.find((item) => item.tenantId === ACME_TENANT_ID)
    await api.statuses.update(status?.id ?? '', { name: 'Renamed status' })
    const entry = tables().auditLogs.find((log) => log.entityId === status?.id && log.newValue?.name === 'Renamed status')
    expect(entry?.previousValue?.name).toBe(status?.name)
  })

  it('merges tags onto leads', async () => {
    const tags = tables().tags.filter((tag) => tag.tenantId === ACME_TENANT_ID)
    const [source, target] = tags
    const lead = tables().leads.find((item) => item.tenantId === ACME_TENANT_ID)
    if (!source || !target || !lead) return
    lead.tags = [...new Set([...lead.tags, source.name])]
    await api.settings.tags.merge(source.id, target.id)
    const saved = tables().leads.find((item) => item.id === lead.id)
    expect(saved?.tags).toContain(target.name)
    expect(saved?.tags).not.toContain(source.name)
    expect(tables().tags.some((tag) => tag.id === source.id)).toBe(false)
  })

  it('evaluates rules in priority order and falls back', async () => {
    const matched = await api.settings.assignmentRules.evaluate({ score: 90 })
    expect(matched.ruleId).toBeTruthy()
    await api.settings.workspace.update({ assignmentFallback: { userId: USERS.vikram } })
    for (const rule of tables().assignmentRules.filter((item) => item.tenantId === ACME_TENANT_ID)) {
      await api.settings.assignmentRules.update(rule.id, { isActive: false })
    }
    const fallback = await api.settings.assignmentRules.evaluate({ score: 1 })
    expect(fallback.userId).toBe(USERS.vikram)
    expect(fallback.reason).toBe('Fallback assignee')
  })
})

afterEach(() => teardownMock())
