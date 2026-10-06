import type { Conversation, Message, SendMessageInput } from '@/types'
import type { RequestContext } from '../core/context'
import { notify, recordActivity } from '../core/records'

export function previewOf(body: string): string {
  return body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90)
}

export function touchConversation(
  ctx: RequestContext,
  conversation: Conversation,
  message: Message,
  unreadDelta = 0,
): Conversation {
  return ctx.db.save('conversations', {
    ...conversation,
    lastMessageAt: message.sentAt,
    lastMessagePreview: previewOf(message.body) || conversation.lastMessagePreview,
    unreadCount: Math.max(0, conversation.unreadCount + unreadDelta),
  })
}

export function recordOutboundContact(ctx: RequestContext, conversation: Conversation, message: Message): void {
  if (!conversation.leadId || message.isInternalNote) return
  const lead = ctx.db.find('leads', conversation.leadId)
  if (!lead) return
  if (conversation.channel === 'email') {
    recordActivity(ctx, lead.id, {
      type: 'email_sent',
      data: { subject: message.subject ?? '', body: previewOf(message.body) },
    })
  } else if (conversation.channel === 'whatsapp') {
    recordActivity(ctx, lead.id, { type: 'whatsapp_sent', data: { body: previewOf(message.body) } })
  }
  ctx.db.save('leads', {
    ...lead,
    lastContactedAt: ctx.timestamp,
    firstResponseTimeMins:
      lead.firstResponseTimeMins ??
      Math.max(1, Math.round((ctx.now.getTime() - Date.parse(lead.createdAt)) / 60_000)),
    updatedAt: ctx.timestamp,
  })
}

const TRIAGE_ROLES = new Set(['super_admin', 'admin', 'manager'])

/** Who hears about an inbound message: the assignee, else the lead owner, else the triage team. */
function inboundRecipients(ctx: RequestContext, conversation: Conversation, leadOwner: string | null): string[] {
  const owner = conversation.assignedTo ?? leadOwner
  if (owner) return [owner]
  return ctx.db
    .all('users')
    .filter((user) => TRIAGE_ROLES.has(user.role) && user.status === 'active')
    .map((user) => user.id)
}

export function recordInboundContact(ctx: RequestContext, conversation: Conversation, message: Message): void {
  const lead = conversation.leadId ? ctx.db.find('leads', conversation.leadId) : undefined
  if (lead) {
    if (conversation.channel === 'email') {
      recordActivity(ctx, lead.id, {
        type: 'email_received',
        data: { subject: message.subject ?? '', body: previewOf(message.body) },
      })
    } else if (conversation.channel === 'whatsapp') {
      recordActivity(ctx, lead.id, { type: 'whatsapp_received', data: { body: previewOf(message.body) } })
    }
  }
  if (conversation.channel === 'call') return
  const sender = lead?.name ?? conversation.contactName ?? conversation.contactPhone ?? conversation.contactEmail ?? 'Unknown contact'
  for (const recipient of inboundRecipients(ctx, conversation, lead?.assignedTo ?? null)) {
    // The sender is the customer, not the signed-in user, so the actor is never skipped here.
    notify(
      ctx,
      recipient,
      {
        type: conversation.channel === 'email' ? 'email_received' : 'whatsapp_reply',
        title: conversation.channel === 'email' ? `New email from ${sender}` : `WhatsApp from ${sender}`,
        body: previewOf(message.subject ? `${message.subject} · ${message.body}` : message.body),
        link: `/inbox/${conversation.id}`,
      },
      { includeActor: true },
    )
  }
}

/** Keys of the workspace's lead custom fields, for `{{lead.custom.<key>}}`. */
export function leadCustomKeys(ctx: RequestContext): string[] {
  return ctx.db
    .all('customFields')
    .filter((field) => field.entity === 'lead')
    .map((field) => field.key)
}

export function workspaceName(ctx: RequestContext): string | null {
  return ctx.db.find('tenantSettings', ctx.tenantId)?.workspace.name ?? null
}

export function messageTypeOf(input: SendMessageInput): Message['type'] {
  if (input.isInternalNote) return 'note'
  if (input.templateId) return 'template'
  const kind = input.attachments?.[0]?.kind
  if (kind === 'image' || kind === 'document' || kind === 'audio') return kind
  return 'text'
}
