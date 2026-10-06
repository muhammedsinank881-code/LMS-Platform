import type { ConversationsApiClient } from '@/services/api/conversations'
import type { Conversation, ConversationFilterField, Lead, ListParams, Message } from '@/types'
import { request, type RequestContext } from '../core/context'
import { applyListParams, propertyValue, type ListSpec } from '../core/list-engine'
import { recordAudit } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import { createLeadRecord } from './leads/create'
import { requireConversation, tickInbox, visibleConversations } from './conversations-access'
import { retryOutbound, sendOutbound, writeInternalNote } from './conversations-send'

const FIELDS: readonly ConversationFilterField[] = [
  'channel',
  'assignedTo',
  'leadId',
  'unreadCount',
  'lastMessageAt',
  'status',
]

function spec(ctx: RequestContext): ListSpec<Conversation, ConversationFilterField> {
  return {
    fields: FIELDS,
    value: propertyValue,
    searchable(row) {
      const lead = row.leadId ? ctx.db.find('leads', row.leadId) : undefined
      const bodies = ctx.db
        .all('messages')
        .filter((message) => message.conversationId === row.id)
        .map((message) => message.body)
      return [
        row.subject,
        row.lastMessagePreview,
        row.contactName,
        row.contactPhone,
        row.contactEmail,
        lead?.name,
        lead?.company,
        lead?.phone,
        ...bodies,
      ]
    },
    defaultSort: [{ field: 'lastMessageAt', direction: 'desc' }],
    now: ctx.now,
  }
}

function requireLead(ctx: RequestContext, leadId: string): Lead {
  const lead = ctx.db.get('leads', leadId, 'Lead')
  ctx.assertInScope('leads', lead.assignedTo, lead.createdBy)
  return lead
}

function sourceFor(ctx: RequestContext, channel: Conversation['channel']): string {
  const key = channel === 'email' ? 'email' : channel === 'whatsapp' ? 'whatsapp' : 'phone'
  return ctx.db.all('leadSources').find((source) => source.key === key)?.id ?? ctx.db.all('leadSources')[0].id
}

/** Newest first, so page 1 is the latest messages and later pages go back in time. */
function listMessages(ctx: RequestContext, id: string, params?: ListParams) {
  requireConversation(ctx, id, 'view')
  const rows = ctx.db.all('messages').filter((message) => message.conversationId === id)
  return applyListParams(rows, { pageSize: 50, ...params, sort: [{ field: 'sentAt', direction: 'desc' }] }, {
    fields: ['sentAt'],
    value: (row: Message, field: 'sentAt') => row[field],
    defaultSort: [{ field: 'sentAt', direction: 'desc' }],
    now: ctx.now,
  }, 'messages')
}

function contactFor(lead: Lead, channel: Conversation['channel']): { phone: string | null; email: string | null } {
  const phone = lead.whatsapp ?? lead.phone
  if (channel === 'email' && !lead.email) throw validationError('channel', 'This lead has no email address.')
  if (channel !== 'email' && !phone) throw validationError('channel', 'This lead has no phone number.')
  return { phone, email: lead.email }
}

export const mockConversationsApi: ConversationsApiClient = {
  list: (params) =>
    request((ctx) => {
      ctx.require('inbox', 'view')
      tickInbox(ctx)
      return applyListParams(visibleConversations(ctx), params, spec(ctx), 'conversations')
    }),
  get: (id) =>
    request((ctx) => {
      tickInbox(ctx)
      return requireConversation(ctx, id, 'view')
    }),
  listMessages: (id, params) =>
    request((ctx) => {
      tickInbox(ctx)
      return listMessages(ctx, id, params)
    }),
  sendMessage: (id, input) =>
    request((ctx) => sendOutbound(ctx, requireConversation(ctx, id, 'create'), input)),
  retryMessage: (id, messageId) =>
    request((ctx) => {
      const conversation = requireConversation(ctx, id, 'create')
      return retryOutbound(ctx, conversation, ctx.db.get('messages', messageId, 'Message'))
    }),
  addInternalNote: (id, body) =>
    request((ctx) => writeInternalNote(ctx, requireConversation(ctx, id, 'create'), body)),
  saveDraft: (id, draft) =>
    request((ctx) => {
      const conversation = requireConversation(ctx, id, 'edit')
      return ctx.db.save('conversations', {
        ...conversation,
        emailDraft: draft
          ? { to: draft.to, cc: draft.cc ?? '', bcc: draft.bcc ?? '', subject: draft.subject, body: draft.body }
          : null,
      })
    }),
  markRead: (id) =>
    request((ctx) => {
      const conversation = requireConversation(ctx, id, 'view')
      return ctx.db.save('conversations', { ...conversation, unreadCount: 0 })
    }),
  assign: (id, userId) =>
    request((ctx) => {
      const conversation = requireConversation(ctx, id, 'assign')
      if (userId && !ctx.db.find('users', userId)) throw validationError('userId', 'Select a valid team member.')
      const saved = ctx.db.save('conversations', { ...conversation, assignedTo: userId })
      recordAudit(ctx, {
        action: 'assigned',
        entity: 'conversation',
        entityId: saved.id,
        entityLabel: saved.contactName ?? saved.id,
        previousValue: { assignedTo: conversation.assignedTo },
        newValue: { assignedTo: userId },
      })
      return saved
    }),
  close: (id) =>
    request((ctx) => {
      const conversation = requireConversation(ctx, id, 'edit')
      return ctx.db.save('conversations', { ...conversation, status: 'closed' })
    }),
  reopen: (id) =>
    request((ctx) => {
      const conversation = requireConversation(ctx, id, 'edit')
      return ctx.db.save('conversations', { ...conversation, status: 'open' })
    }),
  linkToLead: (id, leadId) =>
    request((ctx) => {
      const conversation = requireConversation(ctx, id, 'edit')
      const lead = requireLead(ctx, leadId)
      return ctx.db.save('conversations', {
        ...conversation,
        leadId: lead.id,
        contactName: lead.name,
        contactPhone: conversation.contactPhone ?? lead.phone ?? lead.whatsapp,
        contactEmail: conversation.contactEmail ?? lead.email,
        assignedTo: conversation.assignedTo ?? lead.assignedTo,
      })
    }),
  createLeadFromConversation: (id, input) =>
    request((ctx) => {
      ctx.require('leads', 'create')
      const conversation = requireConversation(ctx, id, 'edit')
      if (conversation.leadId) throw validationError('leadId', 'This conversation already has a lead.')
      const lead = createLeadRecord(ctx, {
        name: input?.name?.trim() || conversation.contactName || conversation.contactPhone || conversation.contactEmail || 'Unknown',
        phone: conversation.contactPhone,
        email: conversation.contactEmail,
        whatsapp: conversation.channel === 'whatsapp' ? conversation.contactPhone : null,
        company: input?.company ?? null,
        sourceId: sourceFor(ctx, conversation.channel),
      })
      const saved = ctx.db.save('conversations', {
        ...conversation,
        leadId: lead.id,
        contactName: lead.name,
        assignedTo: conversation.assignedTo ?? lead.assignedTo,
      })
      return { conversation: saved, lead }
    }),
  startForLead: (leadId, channel) =>
    request((ctx) => {
      ctx.require('inbox', 'create')
      const lead = requireLead(ctx, leadId)
      const existing = ctx.db.all('conversations').find((row) => row.leadId === lead.id && row.channel === channel)
      if (existing) return existing
      const contact = contactFor(lead, channel)
      return ctx.db.insert('conversations', {
        id: newId('conv'),
        leadId: lead.id,
        channel,
        assignedTo: lead.assignedTo ?? ctx.actor.id,
        status: 'open',
        contactName: lead.name,
        contactPhone: contact.phone,
        contactEmail: contact.email,
        subject: null,
        lastMessageAt: ctx.timestamp,
        lastMessagePreview: '',
        unreadCount: 0,
        windowExpiresAt: null,
        emailDraft: null,
        createdAt: ctx.timestamp,
      })
    }),
}
