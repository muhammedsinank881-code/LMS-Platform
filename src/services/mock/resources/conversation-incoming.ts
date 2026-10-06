import { matchLeadByContact } from '@/lib/inbox/auto-link'
import { windowExpiresAtFrom } from '@/lib/inbox/whatsapp-window'
import { normalizeEmail } from '@/lib/duplicates'
import { normalizePhone } from '@/lib/phone'
import type { Channel, Conversation, Lead, LeadId, Message, MessageDirection } from '@/types'
import type { RequestContext } from '../core/context'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import { emit } from '../automation/event-bus'
import { recordInboundContact, touchConversation } from './conversation-effects'

function findOpen(
  ctx: RequestContext,
  channel: Channel,
  leadId: LeadId | null,
  phone: string | null,
  email: string | null,
): Conversation | undefined {
  return ctx.db.all('conversations').find((row) => {
    if (row.channel !== channel || row.status !== 'open') return false
    if (leadId && row.leadId === leadId) return true
    if (phone && row.contactPhone === phone) return true
    if (email && row.contactEmail === email) return true
    return false
  })
}

export function resolveIncomingContact(
  ctx: RequestContext,
  input: { leadId?: LeadId; phone?: string; email?: string },
): { lead: Lead | null; phone: string | null; email: string | null } {
  if (input.leadId) {
    const lead = ctx.db.get('leads', input.leadId, 'Lead')
    return {
      lead,
      phone: normalizePhone(input.phone ?? lead.whatsapp ?? lead.phone),
      email: normalizeEmail(input.email ?? lead.email),
    }
  }
  const phone = normalizePhone(input.phone)
  const email = normalizeEmail(input.email)
  if (!phone && !email) throw validationError('phone', 'Choose a lead or enter a phone or email.')
  return { lead: matchLeadByContact(ctx.db.all('leads'), { phone, email }), phone, email }
}

export function ensureConversation(
  ctx: RequestContext,
  channel: Channel,
  lead: Lead | null,
  phone: string | null,
  email: string | null,
): Conversation {
  const existing = findOpen(ctx, channel, lead?.id ?? null, phone, email)
  if (existing) return existing
  return ctx.db.insert('conversations', {
    id: newId('conv'),
    leadId: lead?.id ?? null,
    channel,
    assignedTo: lead?.assignedTo ?? null,
    status: 'open',
    contactName: lead?.name ?? null,
    contactPhone: phone,
    contactEmail: email,
    subject: null,
    lastMessageAt: ctx.timestamp,
    lastMessagePreview: '',
    unreadCount: 0,
    windowExpiresAt: null,
    emailDraft: null,
    createdAt: ctx.timestamp,
  })
}

export function insertInboundMessage(
  ctx: RequestContext,
  conversation: Conversation,
  input: { body: string; subject?: string | null },
): Message {
  const message: Message = ctx.db.insert('messages', {
    id: newId('msg'),
    conversationId: conversation.id,
    channel: conversation.channel,
    direction: 'inbound' satisfies MessageDirection,
    type: 'text',
    body: input.body,
    subject: input.subject ?? conversation.subject,
    status: 'delivered',
    attachments: [],
    durationSecs: null,
    templateId: null,
    senderId: null,
    isInternalNote: false,
    queuedAt: null,
    sentAt: ctx.timestamp,
    deliveredAt: ctx.timestamp,
    readAt: null,
    failedAt: null,
    openedAt: null,
    clickedAt: null,
  })
  const windowExpiresAt =
    conversation.channel === 'whatsapp' ? windowExpiresAtFrom(message.sentAt) : conversation.windowExpiresAt
  const saved = touchConversation(
    ctx,
    { ...conversation, windowExpiresAt, subject: message.subject ?? conversation.subject },
    message,
    1,
  )
  recordInboundContact(ctx, saved, message)
  if (saved.leadId) {
    emit(ctx, {
      type: 'message_received',
      entity: { kind: 'lead', id: saved.leadId },
      data: { channel: saved.channel === 'email' ? 'email' : 'whatsapp' },
    })
  }
  return message
}
