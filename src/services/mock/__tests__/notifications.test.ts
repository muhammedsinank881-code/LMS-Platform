import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'

beforeEach(setupMock)
afterEach(teardownMock)

describe('notifications', () => {
  it('notifies the assignee when a lead is assigned', async () => {
    actAs(USERS.neha)
    const lead = tables().leads.find((item) => item.tenantId === ACME_TENANT_ID && item.assignedTo !== USERS.ananya)
    if (!lead) throw new Error('missing lead')
    await api.leads.assign(lead.id, USERS.ananya)
    const note = tables().notifications.find(
      (item) => item.userId === USERS.ananya && item.type === 'lead_assigned' && item.link === `/leads/${lead.id}`,
    )
    expect(note?.readAt).toBeNull()
  })

  it('toggles read state and the unread count', async () => {
    actAs(USERS.ananya)
    const before = await api.notifications.getUnreadCount(ACME_TENANT_ID)
    const list = await api.notifications.list({ pageSize: 5 })
    const item = list.items[0]
    if (!item) throw new Error('missing notification')
    const wasUnread = item.readAt === null
    if (wasUnread) await api.notifications.markRead([item.id])
    else await api.notifications.markUnread([item.id])
    const after = await api.notifications.getUnreadCount(ACME_TENANT_ID)
    expect(after).toBe(wasUnread ? before - 1 : before + 1)
    await api.notifications.markAllRead()
    expect(await api.notifications.getUnreadCount(ACME_TENANT_ID)).toBe(0)
  })

  it('reuses an unread reminder instead of inserting a second one', async () => {
    actAs(USERS.ananya)
    const input = {
      type: 'followup_due' as const,
      title: 'Follow-up coming up',
      body: 'Call is due soon',
      link: '/follow-ups?bucket=today',
    }
    const first = await api.notifications.create(input)
    const second = await api.notifications.create(input)
    expect(second.id).toBe(first.id)
    const copies = tables().notifications.filter((item) => item.userId === USERS.ananya && item.link === input.link && item.readAt === null)
    expect(copies).toHaveLength(1)
  })

  it('stores preferences and suppresses a reminder during quiet hours', async () => {
    actAs(USERS.ananya)
    const defaults = await api.notifications.getPreferences()
    await api.notifications.updatePreferences({
      ...defaults,
      quietHours: { enabled: true, start: '00:00', end: '23:59' },
    })
    const created = await api.notifications.create({
      type: 'followup_overdue',
      title: 'Follow-up overdue',
      body: 'Quiet',
      link: '/follow-ups?bucket=quiet-test',
    })
    expect(tables().notifications.some((item) => item.id === created.id)).toBe(false)
  })
})
