import { getWhatsAppWindow } from '@/lib/inbox/whatsapp-window'
import { renderTemplate, validateTemplateVariables } from '@/lib/inbox/template-variables'
import type { Conversation, Message, MessageTemplate, SendMessageInput } from '@/types'
import type { RequestContext } from '../core/context'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import {
  leadCustomKeys,
  messageTypeOf,
  recordOutboundContact,
  touchConversation,
  workspaceName,
} from './conversation-effects'

function approvedTemplate(ctx: RequestContext, id: string, channel: Conversation['channel']): MessageTemplate {
  const template = ctx.db.find('templates', id)
  if (!template) throw validationError('templateId', 'Select a valid template.')
  if (template.channel !== channel) throw validationError('templateId', 'That template is for another channel.')
  if (template.status !== 'approved') throw validationError('templateId', 'Only approved templates can be sent.')
  return template
}

export function renderForConversation(
  ctx: RequestContext,
  conversation: Conversation,
  text: string,
  values: Record<string, string> = {},
): string {
  const lead = conversation.leadId ? ctx.db.find('leads', conversation.leadId) : null
  const owner = lead?.assignedTo ? ctx.db.find('users', lead.assignedTo) : ctx.actor
  return renderTemplate(text, { lead, owner, companyName: workspaceName(ctx), fallbacks: values }).text
}

/**
 * WhatsApp templates are fixed by Meta, so the server renders them from the template and the
 * sender's variable values. Email templates are a starting point: the edited body is sent.
 */
function bodyFor(ctx: RequestContext, conversation: Conversation, input: SendMessageInput): string {
  if (!input.templateId) return input.body.trim()
  const template = approvedTemplate(ctx, input.templateId, conversation.channel)
  const { unknown } = validateTemplateVariables(`${template.subject ?? ''} ${template.body}`, leadCustomKeys(ctx))
  if (unknown.length > 0) throw validationError('templateId', `Unknown variables: ${unknown.join(', ')}.`)
  if (conversation.channel === 'email' && input.body.trim()) return input.body.trim()
  const values = { ...template.sampleValues, ...input.templateVariables }
  return renderForConversation(ctx, conversation, template.body, values).trim()
}

function assertCanSend(ctx: RequestContext, conversation: Conversation, input: SendMessageInput): void {
  if (conversation.channel === 'call') throw validationError('channel', 'Calls are logged, not sent.')
  if (conversation.status === 'closed') throw validationError('status', 'Reopen the conversation to send.')
  if (input.isInternalNote) throw validationError('body', 'Use the note action for internal notes.')
  if (conversation.channel === 'whatsapp' && !input.templateId) {
    const window = getWhatsAppWindow(conversation.windowExpiresAt, ctx.now)
    if (!window.canFreeText) {
      throw validationError('body', 'The 24-hour window is closed. Send an approved template.')
    }
  }
}

export function sendOutbound(
  ctx: RequestContext,
  conversation: Conversation,
  input: SendMessageInput,
): Message {
  assertCanSend(ctx, conversation, input)
  const attachments = input.attachments ?? []
  const body = bodyFor(ctx, conversation, input)
  if (!body && attachments.length === 0) throw validationError('body', 'Write a message first.')

  const message: Message = ctx.db.insert('messages', {
    id: newId('msg'),
    conversationId: conversation.id,
    channel: conversation.channel,
    direction: 'outbound',
    type: messageTypeOf(input),
    body,
    subject: conversation.channel === 'email' ? (input.subject ?? conversation.subject) : null,
    status: 'sent',
    attachments,
    durationSecs: null,
    templateId: input.templateId ?? null,
    senderId: ctx.actor.id,
    isInternalNote: false,
    queuedAt: ctx.timestamp,
    sentAt: ctx.timestamp,
    deliveredAt: null,
    readAt: null,
    failedAt: null,
    openedAt: null,
    clickedAt: null,
  })
  const saved = touchConversation(
    ctx,
    {
      ...conversation,
      unreadCount: 0,
      subject: message.subject ?? conversation.subject,
      emailDraft: conversation.channel === 'email' ? null : conversation.emailDraft,
    },
    message,
  )
  recordOutboundContact(ctx, saved, message)
  return message
}

/** Sends a failed message again as the same message, so the thread never shows duplicates. */
export function retryOutbound(ctx: RequestContext, conversation: Conversation, failed: Message): Message {
  if (failed.conversationId !== conversation.id || failed.status !== 'failed') {
    throw validationError('messageId', 'Only a failed message can be retried.')
  }
  assertCanSend(ctx, conversation, { body: failed.body, templateId: failed.templateId ?? undefined })
  const message = ctx.db.save('messages', {
    ...failed,
    status: 'sent',
    queuedAt: ctx.timestamp,
    sentAt: ctx.timestamp,
    deliveredAt: null,
    readAt: null,
    failedAt: null,
  })
  const saved = touchConversation(ctx, conversation, message)
  recordOutboundContact(ctx, saved, message)
  return message
}

export function writeInternalNote(ctx: RequestContext, conversation: Conversation, body: string): Message {
  const text = body.trim()
  if (!text) throw validationError('body', 'Write a note first.')
  const message: Message = ctx.db.insert('messages', {
    id: newId('msg'),
    conversationId: conversation.id,
    channel: conversation.channel,
    direction: 'outbound',
    type: 'note',
    body: text,
    subject: null,
    status: 'read',
    attachments: [],
    durationSecs: null,
    templateId: null,
    senderId: ctx.actor.id,
    isInternalNote: true,
    queuedAt: null,
    sentAt: ctx.timestamp,
    deliveredAt: ctx.timestamp,
    readAt: ctx.timestamp,
    failedAt: null,
    openedAt: null,
    clickedAt: null,
  })
  return message
}
