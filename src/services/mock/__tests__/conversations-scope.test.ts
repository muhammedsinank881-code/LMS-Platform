import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { NORTHWIND_TENANT_ID, USERS, actAs, setupMock, teardownMock } from './helpers'
import { leadOwnedBy, must } from './inbox-fixtures'

beforeEach(setupMock)
afterEach(teardownMock)

const DENIED = { code: expect.stringMatching(/FORBIDDEN|NOT_FOUND/) }

/** A conversation about a lead that belongs to Sneha (south team), created by an admin. */
async function southThread() {
  actAs(USERS.arjun)
  const lead = leadOwnedBy(USERS.sneha, 'phone')
  const { conversation } = await api.simulator.incomingWhatsApp({ leadId: lead.id, body: 'Hello south team' })
  expect(conversation.assignedTo).toBe(USERS.sneha)
  return conversation
}

describe('conversation data scope', () => {
  it('lets a salesperson see threads of their own leads', async () => {
    actAs(USERS.arjun)
    const lead = leadOwnedBy(USERS.ananya, 'phone')
    const { conversation } = await api.simulator.incomingWhatsApp({ leadId: lead.id, body: 'Mine' })
    actAs(USERS.ananya)
    const listed = await api.conversations.list({ pageSize: 200 })
    expect(listed.items.some((item) => item.id === conversation.id)).toBe(true)
    await expect(api.conversations.get(conversation.id)).resolves.toMatchObject({ id: conversation.id })
  })

  it('lets a salesperson see a thread assigned to them even if the lead is someone else\'s', async () => {
    actAs(USERS.arjun)
    const lead = leadOwnedBy(USERS.ananya, 'phone')
    const created = await api.conversations.startForLead(lead.id, 'whatsapp')
    await api.conversations.assign(created.id, USERS.vikram)
    actAs(USERS.vikram)
    const listed = await api.conversations.list({ pageSize: 200 })
    expect(listed.items.some((item) => item.id === created.id)).toBe(true)
  })

  it('hides threads of other salespeople\'s leads from the list and every action', async () => {
    const thread = await southThread()
    actAs(USERS.ananya)
    const listed = await api.conversations.list({ pageSize: 500 })
    expect(listed.items.some((item) => item.id === thread.id)).toBe(false)
    await expect(api.conversations.get(thread.id)).rejects.toMatchObject(DENIED)
    await expect(api.conversations.listMessages(thread.id)).rejects.toMatchObject(DENIED)
    await expect(api.conversations.sendMessage(thread.id, { body: 'Sneaky' })).rejects.toMatchObject(DENIED)
    await expect(api.conversations.markRead(thread.id)).rejects.toMatchObject(DENIED)
  })

  it('shows the team leader their own team, but not the other team', async () => {
    const thread = await southThread()
    actAs(USERS.karan) // south team leader
    expect((await api.conversations.list({ pageSize: 500 })).items.some((item) => item.id === thread.id)).toBe(true)
    actAs(USERS.rahul) // north team leader
    expect((await api.conversations.list({ pageSize: 500 })).items.some((item) => item.id === thread.id)).toBe(false)
  })

  it('lets managers and admins see everything', async () => {
    const thread = await southThread()
    for (const user of [USERS.neha, USERS.arjun, USERS.priya]) {
      actAs(user)
      expect((await api.conversations.list({ pageSize: 500 })).items.some((item) => item.id === thread.id)).toBe(true)
    }
  })

  it('hides another tenant\'s conversations', async () => {
    actAs(USERS.arjun)
    const acme = must((await api.conversations.list({ pageSize: 5 })).items[0], 'an Acme conversation')
    actAs(USERS.priya, { tenantId: NORTHWIND_TENANT_ID })
    await expect(api.conversations.get(acme.id)).rejects.toMatchObject({ code: 'NOT_FOUND' })
    expect((await api.conversations.list({ pageSize: 500 })).items.some((item) => item.id === acme.id)).toBe(false)
  })
})

describe('inbox permissions', () => {
  it('only roles with the assign permission can assign a conversation', async () => {
    actAs(USERS.arjun)
    const lead = leadOwnedBy(USERS.ananya, 'phone')
    const { conversation } = await api.simulator.incomingWhatsApp({ leadId: lead.id, body: 'Assign me' })
    actAs(USERS.ananya)
    await expect(api.conversations.assign(conversation.id, USERS.vikram)).rejects.toMatchObject({ code: 'FORBIDDEN' })
    actAs(USERS.neha)
    await expect(api.conversations.assign(conversation.id, USERS.vikram)).resolves.toMatchObject({ assignedTo: USERS.vikram })
  })

  it('a salesperson cannot edit call notes on a call they cannot see', async () => {
    actAs(USERS.arjun)
    const lead = leadOwnedBy(USERS.sneha, 'phone')
    const log = await api.callLogs.create({ leadId: lead.id, direction: 'outbound', outcome: 'connected', durationSecs: 60, notes: 'Original' })
    actAs(USERS.ananya)
    await expect(api.callLogs.updateNotes(log.id, 'Tampered')).rejects.toMatchObject({ code: 'FORBIDDEN' })
    actAs(USERS.sneha)
    await expect(api.callLogs.updateNotes(log.id, 'Updated by owner')).resolves.toMatchObject({ notes: 'Updated by owner' })
  })
})
