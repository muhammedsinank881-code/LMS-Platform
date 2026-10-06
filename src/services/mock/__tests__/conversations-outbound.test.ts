import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import { TEMPLATE_BODY, advance, leadOwnedBy, must } from './inbox-fixtures'

beforeEach(setupMock)
afterEach(teardownMock)

/** An open WhatsApp window with a known lead: the customer just wrote in. */
async function openWhatsApp(userId = USERS.ananya) {
  const lead = leadOwnedBy(userId, 'phone')
  const { conversation } = await api.simulator.incomingWhatsApp({ leadId: lead.id, body: 'Hello, any update?' })
  return { lead, conversation }
}

function leadRow(id: string) {
  return must(tables().leads.find((row) => row.id === id), `lead ${id}`)
}

describe('sending a WhatsApp message', () => {
  it('writes the activity and lastContactedAt, and sets the first response time once', async () => {
    actAs(USERS.ananya)
    const { lead, conversation } = await openWhatsApp()
    leadRow(lead.id).firstResponseTimeMins = null

    const first = await api.conversations.sendMessage(conversation.id, { body: 'Checking in from the test.' })
    expect(first.status).toBe('sent')
    expect(leadRow(lead.id).lastContactedAt).toBe(first.sentAt)
    const firstResponse = leadRow(lead.id).firstResponseTimeMins
    expect(firstResponse).toBeGreaterThan(0)
    expect(
      tables().activities.some(
        (item) => item.leadId === lead.id && item.type === 'whatsapp_sent' && item.data.body.includes('Checking in'),
      ),
    ).toBe(true)

    advance(60_000)
    await api.conversations.sendMessage(conversation.id, { body: 'A second message.' })
    expect(leadRow(lead.id).firstResponseTimeMins).toBe(firstResponse)
  })

  it('moves sent to delivered to read on timers, with timestamps', async () => {
    actAs(USERS.ananya)
    const { conversation } = await openWhatsApp()
    const message = await api.conversations.sendMessage(conversation.id, { body: 'Status check.' })
    const statusAfter = async (ms: number) => {
      advance(ms)
      const page = await api.conversations.listMessages(conversation.id, { pageSize: 100 })
      return must(page.items.find((item) => item.id === message.id), 'sent message')
    }

    expect((await statusAfter(0)).status).toBe('sent')
    const delivered = await statusAfter(1_000)
    expect(delivered.status).toBe('delivered')
    expect(delivered.deliveredAt).toBeTruthy()
    expect(delivered.readAt).toBeNull()
    const read = await statusAfter(3_000)
    expect(read.status).toBe('read')
    expect(read.readAt).toBeTruthy()
  })

  it('rejects free text once the 24-hour window has closed, but allows an approved template', async () => {
    actAs(USERS.arjun)
    const { conversation } = await openWhatsApp(USERS.ananya)
    advance(25 * 3_600_000)
    await expect(api.conversations.sendMessage(conversation.id, { body: 'Too late.' })).rejects.toMatchObject({ code: 'VALIDATION' })

    const template = await api.templates.create({ name: 'Quote ready', channel: 'whatsapp', category: 'utility', language: 'en', body: TEMPLATE_BODY })
    await api.templates.submitForApproval(template.id)
    advance(25 * 3_600_000 + 5_000)
    await api.templates.listAll()
    const sent = await api.conversations.sendMessage(conversation.id, {
      body: '',
      templateId: template.id,
      templateVariables: { 'owner.name': 'Meera' },
    })
    expect(sent.type).toBe('template')
    expect(sent.body).toContain('Meera will call you')
  })

  it('refuses to send in a closed conversation', async () => {
    actAs(USERS.ananya)
    const { conversation } = await openWhatsApp()
    await api.conversations.close(conversation.id)
    await expect(api.conversations.sendMessage(conversation.id, { body: 'Hello?' })).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})

describe('failed messages', () => {
  it('retry resends the same message instead of adding a duplicate', async () => {
    actAs(USERS.ananya)
    const { conversation } = await openWhatsApp()
    const message = await api.conversations.sendMessage(conversation.id, { body: 'Will fail.' })
    await api.simulator.setDeliveryStatus(message.id, 'failed')
    const before = (await api.conversations.listMessages(conversation.id, { pageSize: 100 })).total

    const retried = await api.conversations.retryMessage(conversation.id, message.id)
    expect(retried.id).toBe(message.id)
    expect(retried.status).toBe('sent')
    expect(retried.failedAt).toBeNull()
    expect((await api.conversations.listMessages(conversation.id, { pageSize: 100 })).total).toBe(before)
  })

  it('only failed messages can be retried', async () => {
    actAs(USERS.ananya)
    const { conversation } = await openWhatsApp()
    const message = await api.conversations.sendMessage(conversation.id, { body: 'Fine.' })
    await expect(api.conversations.retryMessage(conversation.id, message.id)).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})

describe('sending an email', () => {
  it('writes email_sent with the subject, updates lastContactedAt, and becomes delivered', async () => {
    actAs(USERS.ananya)
    const lead = leadOwnedBy(USERS.ananya, 'email')
    const conversation = await api.conversations.startForLead(lead.id, 'email')
    const message = await api.conversations.sendMessage(conversation.id, {
      body: '<p>Hello <b>there</b></p>',
      subject: 'Your proposal',
      to: lead.email ?? '',
    })
    expect(message.subject).toBe('Your proposal')
    expect(leadRow(lead.id).lastContactedAt).toBe(message.sentAt)
    expect(tables().activities.some((item) => item.leadId === lead.id && item.type === 'email_sent' && item.data.subject === 'Your proposal')).toBe(true)

    advance(1_000)
    const page = await api.conversations.listMessages(conversation.id, { pageSize: 100 })
    expect(must(page.items.find((item) => item.id === message.id), 'email').status).toBe('delivered')
  })

  it('shows opens and clicks once the provider reports them', async () => {
    actAs(USERS.ananya)
    const lead = leadOwnedBy(USERS.ananya, 'email')
    const conversation = await api.conversations.startForLead(lead.id, 'email')
    const message = await api.conversations.sendMessage(conversation.id, { body: 'See the link', subject: 'Hello', to: lead.email ?? '' })
    expect(message.openedAt).toBeNull()
    await api.simulator.emailOpened(message.id)
    const clicked = await api.simulator.emailClicked(message.id)
    expect(clicked.openedAt).toBeTruthy()
    expect(clicked.clickedAt).toBeTruthy()
  })
})
