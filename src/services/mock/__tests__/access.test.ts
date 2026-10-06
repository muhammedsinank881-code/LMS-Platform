import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ApiError } from '@/services/api/errors'
import type { Lead } from '@/types'
import {
  ACME_TENANT_ID,
  NORTHWIND_TENANT_ID,
  USERS,
  actAs,
  setupMock,
  tables,
  teardownMock,
} from './helpers'

beforeEach(setupMock)
afterEach(teardownMock)

const all = { pageSize: 200 }

async function expectCode(promise: Promise<unknown>, code: string): Promise<void> {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  )
  expect(error).toBeInstanceOf(ApiError)
  expect((error as ApiError).code).toBe(code)
}

describe('tenant isolation', () => {
  it('lists only the active workspace’s records', async () => {
    actAs(USERS.priya, { tenantId: NORTHWIND_TENANT_ID })
    const northwind = await api.leads.list(all)
    expect(northwind.total).toBeLessThan(80)
    expect(northwind.items.every((l) => l.tenantId === NORTHWIND_TENANT_ID)).toBe(true)

    actAs(USERS.priya, { tenantId: ACME_TENANT_ID })
    const acme = await api.leads.list(all)
    expect(acme.items.every((l) => l.tenantId === ACME_TENANT_ID)).toBe(true)
    const northwindIds = new Set(northwind.items.map((l) => l.id))
    expect(acme.items.some((l) => northwindIds.has(l.id))).toBe(false)
  })

  it('treats another workspace’s record as not found, for reads and writes', async () => {
    const acmeLead = tables().leads.find((l) => l.tenantId === ACME_TENANT_ID) as Lead
    actAs(USERS.priya, { tenantId: NORTHWIND_TENANT_ID })
    await expectCode(api.leads.get(acmeLead.id), 'NOT_FOUND')
    await expectCode(api.leads.update(acmeLead.id, { name: 'Hijacked' }), 'NOT_FOUND')
    await expectCode(api.leads.delete(acmeLead.id), 'NOT_FOUND')
    expect(tables().leads.find((l) => l.id === acmeLead.id && l.tenantId === ACME_TENANT_ID)?.name).toBe(
      acmeLead.name,
    )
  })

  it('keeps configuration separate per workspace', async () => {
    actAs(USERS.arjun, { tenantId: NORTHWIND_TENANT_ID })
    const created = await api.statuses.create({ name: 'Nurture', color: '#123456', type: 'open' })
    expect(created.tenantId).toBe(NORTHWIND_TENANT_ID)
    actAs(USERS.arjun, { tenantId: ACME_TENANT_ID })
    expect((await api.statuses.listAll()).some((s) => s.name === 'Nurture')).toBe(false)
  })

  it('seeds a usable workspace for a tenant it has never seen', async () => {
    const tenantId = 'tenant-brand-new'
    const { setMockSessionResolver } = await import('@/services/mock')
    setMockSessionResolver(() => ({
      tenantId,
      user: {
        id: 'user-new',
        tenantId,
        name: 'Nina Owner',
        email: 'nina@example.test',
        role: 'admin',
        teamId: null,
        avatarUrl: null,
      },
    }))
    expect((await api.statuses.listAll()).length).toBe(12)
    expect((await api.leads.list()).total).toBe(0)
    const lead = await api.leads.create({ name: 'First Lead', phone: '9876543210', sourceId: (await api.sources.listAll())[0].id })
    expect(lead.tenantId).toBe(tenantId)
  })
})

describe('role data scope', () => {
  it('shows a salesperson only their own leads', async () => {
    actAs(USERS.ananya)
    const { items } = await api.leads.list(all)
    expect(items.length).toBeGreaterThan(5)
    expect(items.every((l) => l.assignedTo === USERS.ananya || l.createdBy === USERS.ananya)).toBe(true)
  })

  it('shows a team leader their team’s leads and nobody else’s', async () => {
    actAs(USERS.rahul)
    const north = new Set<string>([USERS.rahul, USERS.ananya, USERS.vikram])
    const { items } = await api.leads.list(all)
    expect(items.some((l) => l.assignedTo === USERS.ananya)).toBe(true)
    expect(items.every((l) => (l.assignedTo && north.has(l.assignedTo)) || (l.createdBy && north.has(l.createdBy)))).toBe(true)
  })

  it('shows managers and admins everything that is not archived', async () => {
    const visible = tables().leads.filter((l) => l.tenantId === ACME_TENANT_ID && !l.archivedAt).length
    for (const user of [USERS.neha, USERS.arjun]) {
      actAs(user)
      expect((await api.leads.list(all)).total).toBe(visible)
    }
  })

  it('answers FORBIDDEN for an in-workspace record outside the scope', async () => {
    const snehas = tables().leads.find((l) => l.tenantId === ACME_TENANT_ID && l.assignedTo === USERS.sneha) as Lead
    actAs(USERS.ananya)
    await expectCode(api.leads.get(snehas.id), 'FORBIDDEN')
    await expectCode(api.leads.update(snehas.id, { name: 'Nope' }), 'FORBIDDEN')
  })

  it('scopes follow-ups, deals and the unread badge the same way', async () => {
    actAs(USERS.ananya)
    const followUps = await api.followUps.list(all)
    expect(followUps.items.every((f) => f.assigneeId === USERS.ananya || f.createdBy === USERS.ananya)).toBe(true)
    const deals = await api.deals.list(all)
    expect(deals.items.every((d) => d.ownerId === USERS.ananya)).toBe(true)
    const buckets = await api.followUps.getBuckets()
    expect(buckets.overdue + buckets.today + buckets.tomorrow + buckets.upcoming).toBeLessThanOrEqual(
      followUps.total,
    )
  })

  it('applies the acting role of the dev role switcher', async () => {
    actAs(USERS.ananya, { role: 'manager' })
    const visible = tables().leads.filter((l) => l.tenantId === ACME_TENANT_ID && !l.archivedAt).length
    expect((await api.leads.list(all)).total).toBe(visible)
  })
})

describe('permissions on mutations', () => {
  it('forbids deleting leads without the delete permission', async () => {
    const own = tables().leads.find((l) => l.assignedTo === USERS.ananya && l.tenantId === ACME_TENANT_ID) as Lead
    actAs(USERS.ananya)
    await expectCode(api.leads.delete(own.id), 'FORBIDDEN')
    await expectCode(api.leads.assign(own.id, USERS.vikram), 'FORBIDDEN')
    await expectCode(api.leads.exportRows(), 'FORBIDDEN')
    await expectCode(api.leads.import([]), 'FORBIDDEN')
  })

  it('forbids viewing audit logs, automations and campaigns where the role has no access', async () => {
    actAs(USERS.neha)
    await expectCode(api.auditLogs.list(), 'FORBIDDEN')
    actAs(USERS.ananya)
    await expectCode(api.campaigns.list(), 'FORBIDDEN')
    await expectCode(api.automations.list(), 'FORBIDDEN')
    actAs(USERS.arjun)
    expect((await api.auditLogs.list()).total).toBeGreaterThan(50)
  })

  it('lets only workspace admins change configuration, but everyone read it', async () => {
    actAs(USERS.neha)
    expect((await api.statuses.listAll()).length).toBe(12)
    await expectCode(api.statuses.create({ name: 'X', color: '#111111', type: 'open' }), 'FORBIDDEN')
    await expectCode(api.settings.tags.create({ name: 'X', color: '#111111' }), 'FORBIDDEN')
    await expectCode(api.pipelines.deleteStage('whatever'), 'FORBIDDEN')
  })

  it('keeps notifications private to their recipient', async () => {
    actAs(USERS.ananya)
    const mine = await api.notifications.list(all)
    expect(mine.items.every((n) => n.userId === USERS.ananya)).toBe(true)
    const theirs = tables().notifications.find((n) => n.userId === USERS.vikram) as { id: string }
    await expectCode(api.notifications.markRead([theirs.id]), 'NOT_FOUND')
    expect(await api.notifications.getUnreadCount(ACME_TENANT_ID)).toBe(
      mine.items.filter((n) => n.readAt === null).length,
    )
    await expectCode(api.notifications.getUnreadCount(NORTHWIND_TENANT_ID), 'FORBIDDEN')
  })

  it('requires a session at all', async () => {
    const { setMockSessionResolver } = await import('@/services/mock')
    setMockSessionResolver(() => null)
    await expectCode(api.leads.list(), 'unauthorized')
  })
})
