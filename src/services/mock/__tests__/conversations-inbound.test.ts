import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { formatPhone } from '@/lib/phone'
import { api } from '@/services/api'
import { USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import { leadOwnedBy, must } from './inbox-fixtures'

beforeEach(setupMock)
afterEach(teardownMock)

const UNKNOWN_PHONE = '+919999988888'

function notificationsFor(userId: string, conversationId: string) {
  return tables().notifications.filter((item) => item.userId === userId && item.link === `/inbox/${conversationId}`)
}

describe('incoming WhatsApp from a known lead', () => {
  it('auto-links a differently formatted number to the lead by normalized phone', async () => {
    actAs(USERS.arjun)
    const lead = leadOwnedBy(USERS.ananya, 'phone')
    const written = formatPhone(lead.phone).replace(/\s/g, '-') // "+91-98765-43210" instead of "+919876543210"
    expect(written).not.toBe(lead.phone)

    const { conversation } = await api.simulator.incomingWhatsApp({ phone: written, body: 'Hi from another format' })
    expect(conversation.leadId).toBe(lead.id)
    expect(conversation.contactPhone).toBe(lead.phone)
  })

  it('adds exactly one unread per message, and markRead clears them', async () => {
    actAs(USERS.arjun)
    const lead = leadOwnedBy(USERS.ananya, 'phone')
    const first = await api.simulator.incomingWhatsApp({ leadId: lead.id, body: 'One' })
    const second = await api.simulator.incomingWhatsApp({ leadId: lead.id, body: 'Two' })
    expect(second.conversation.id).toBe(first.conversation.id)
    expect(second.conversation.unreadCount).toBe(first.conversation.unreadCount + 1)

    const read = await api.conversations.markRead(first.conversation.id)
    expect(read.unreadCount).toBe(0)
  })

  it('writes whatsapp_received and notifies the assignee, even when the assignee is the signed-in user', async () => {
    actAs(USERS.ananya)
    const lead = leadOwnedBy(USERS.ananya, 'phone')
    const { conversation } = await api.simulator.incomingWhatsApp({ leadId: lead.id, body: 'Are you there?' })

    expect(tables().activities.some((item) => item.leadId === lead.id && item.type === 'whatsapp_received')).toBe(true)
    const [notice] = notificationsFor(USERS.ananya, conversation.id)
    expect(must(notice, 'assignee notification').type).toBe('whatsapp_reply')
    expect(notice.readAt).toBeNull()
  })
})

describe('incoming email', () => {
  it('writes email_received and notifies the assignee with the subject', async () => {
    actAs(USERS.arjun)
    const lead = leadOwnedBy(USERS.ananya, 'email')
    const { conversation, message } = await api.simulator.incomingEmail({ leadId: lead.id, subject: 'Pricing question', body: 'Please share rates.' })

    expect(message.subject).toBe('Pricing question')
    expect(tables().activities.some((item) => item.leadId === lead.id && item.type === 'email_received')).toBe(true)
    const [notice] = notificationsFor(USERS.ananya, conversation.id)
    expect(must(notice, 'assignee notification').type).toBe('email_received')
    expect(notice.body).toContain('Pricing question')
  })
})

describe('an unknown number', () => {
  it('stays unlinked and still notifies the admins and managers', async () => {
    actAs(USERS.ananya)
    const { conversation } = await api.simulator.incomingWhatsApp({ phone: UNKNOWN_PHONE, body: 'New enquiry' })
    expect(conversation.leadId).toBeNull()
    expect(conversation.contactPhone).toBe(UNKNOWN_PHONE)

    for (const triage of [USERS.priya, USERS.arjun, USERS.neha]) {
      expect(notificationsFor(triage, conversation.id)).toHaveLength(1)
    }
    expect(notificationsFor(USERS.sneha, conversation.id)).toHaveLength(0)
  })

  it('becomes a lead on "Create lead", and the next message from that number joins the same thread', async () => {
    actAs(USERS.arjun)
    const { conversation } = await api.simulator.incomingWhatsApp({ phone: UNKNOWN_PHONE, body: 'New enquiry' })
    const created = await api.conversations.createLeadFromConversation(conversation.id, { name: 'Walk-in Customer' })

    expect(created.lead.phone).toBe(UNKNOWN_PHONE)
    expect(created.conversation.leadId).toBe(created.lead.id)
    expect(created.conversation.contactName).toBe('Walk-in Customer')

    const again = await api.simulator.incomingWhatsApp({ phone: UNKNOWN_PHONE, body: 'Following up' })
    expect(again.conversation.id).toBe(conversation.id)
    expect(again.conversation.leadId).toBe(created.lead.id)
  })

  it('can be linked to an existing lead instead', async () => {
    actAs(USERS.arjun)
    const lead = leadOwnedBy(USERS.ananya, 'phone')
    const { conversation } = await api.simulator.incomingWhatsApp({ phone: UNKNOWN_PHONE, body: 'It is me' })
    const linked = await api.conversations.linkToLead(conversation.id, lead.id)
    expect(linked.leadId).toBe(lead.id)
    expect(linked.contactPhone).toBe(UNKNOWN_PHONE)
  })

  it('an unknown email is matched the same way', async () => {
    actAs(USERS.arjun)
    const { conversation } = await api.simulator.incomingEmail({ email: 'nobody@example.com', subject: 'Hello', body: 'Hi there' })
    expect(conversation.leadId).toBeNull()
    expect(conversation.contactEmail).toBe('nobody@example.com')
  })
})

describe('a missed call', () => {
  it('creates a call conversation with a no-answer log', async () => {
    actAs(USERS.arjun)
    const lead = leadOwnedBy(USERS.ananya, 'phone')
    const { conversation, callLog } = await api.simulator.missedCall({ leadId: lead.id })
    expect(conversation.channel).toBe('call')
    expect(callLog.outcome).toBe('no_answer')
    expect(callLog.durationSecs).toBe(0)
    expect(callLog.direction).toBe('inbound')
  })
})
