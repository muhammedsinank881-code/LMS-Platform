import { templateEdgeVariableError } from '@/lib/inbox/template-variables'
import type { Conversation, Message, MessageStatus, MessageTemplate } from '@/types'
import type { RequestContext } from '../core/context'
import { recordAudit } from '../core/records'

const DELIVERED_AFTER_MS = 800
const READ_AFTER_MS = 2_500
const TEMPLATE_APPROVAL_MS = 2_000

export function conversationInScope(ctx: RequestContext, conversation: Conversation): boolean {
  if (ctx.inScope('inbox', conversation.assignedTo)) return true
  if (!conversation.leadId) return false
  const lead = ctx.db.find('leads', conversation.leadId)
  return Boolean(lead && ctx.inScope('leads', lead.assignedTo, lead.createdBy))
}

export function requireConversation(
  ctx: RequestContext,
  id: string,
  action: 'view' | 'create' | 'edit' | 'assign',
): Conversation {
  ctx.require('inbox', action)
  const conversation = ctx.db.get('conversations', id, 'Conversation')
  if (!conversationInScope(ctx, conversation)) {
    ctx.assertInScope('inbox', conversation.assignedTo)
  }
  return conversation
}

export function visibleConversations(ctx: RequestContext): Conversation[] {
  return ctx.db.all('conversations').filter((row) => conversationInScope(ctx, row))
}

/**
 * Outbound WhatsApp goes sent → delivered → read on timers. Email goes sent → delivered;
 * opens and clicks are tracked separately (see the simulator).
 */
export function nextOutboundStatus(message: Message, nowMs: number): Message | null {
  if (message.direction !== 'outbound' || message.channel === 'call') return null
  if (message.isInternalNote || message.status === 'failed' || message.status === 'queued') return null
  const sent = Date.parse(message.sentAt)
  if (Number.isNaN(sent)) return null
  if (message.channel === 'email') {
    if (message.status !== 'sent' || nowMs < sent + DELIVERED_AFTER_MS) return null
    return { ...message, status: 'delivered', deliveredAt: new Date(sent + DELIVERED_AFTER_MS).toISOString() }
  }
  if (nowMs >= sent + READ_AFTER_MS && message.status !== 'read') {
    return {
      ...message,
      status: 'read',
      deliveredAt: message.deliveredAt ?? new Date(sent + DELIVERED_AFTER_MS).toISOString(),
      readAt: new Date(sent + READ_AFTER_MS).toISOString(),
    }
  }
  if (nowMs >= sent + DELIVERED_AFTER_MS && message.status === 'sent') {
    return {
      ...message,
      status: 'delivered',
      deliveredAt: new Date(sent + DELIVERED_AFTER_MS).toISOString(),
    }
  }
  return null
}

export function progressMessageStatuses(ctx: RequestContext): void {
  for (const message of ctx.db.all('messages')) {
    const next = nextOutboundStatus(message, ctx.now.getTime())
    if (next) ctx.db.save('messages', next)
  }
}

/** The simulated review: a real WhatsApp rule decides, so both outcomes can happen. */
export function reviewTemplate(template: MessageTemplate): { status: 'approved' | 'rejected'; reason: string | null } {
  const reason = templateEdgeVariableError(template.body)
  return reason ? { status: 'rejected', reason } : { status: 'approved', reason: null }
}

export function resolveTemplateReview(
  ctx: RequestContext,
  template: MessageTemplate,
  status: 'approved' | 'rejected',
  reason: string | null,
): MessageTemplate {
  const saved = ctx.db.save('templates', {
    ...template,
    status,
    rejectionReason: status === 'rejected' ? reason : null,
    updatedAt: ctx.timestamp,
  })
  recordAudit(ctx, {
    action: 'status_changed',
    entity: 'setting',
    entityId: saved.id,
    entityLabel: `Template: ${saved.name}`,
    previousValue: { status: template.status },
    newValue: status === 'rejected' ? { status, rejectionReason: reason } : { status },
  })
  return saved
}

export function progressTemplateApprovals(ctx: RequestContext): void {
  const cutoff = ctx.now.getTime() - TEMPLATE_APPROVAL_MS
  for (const template of ctx.db.all('templates')) {
    if (template.status !== 'pending') continue
    if (Date.parse(template.updatedAt) > cutoff) continue
    const review = reviewTemplate(template)
    resolveTemplateReview(ctx, template, review.status, review.reason)
  }
}

export function tickInbox(ctx: RequestContext): void {
  progressMessageStatuses(ctx)
  progressTemplateApprovals(ctx)
}

export function applyDeliveryStatus(message: Message, status: MessageStatus, at: string): Message {
  if (status === 'queued') return { ...message, status, queuedAt: at }
  if (status === 'sent') return { ...message, status, sentAt: at, failedAt: null }
  if (status === 'delivered') {
    return { ...message, status, deliveredAt: at, sentAt: message.sentAt || at, failedAt: null }
  }
  if (status === 'read') {
    return {
      ...message,
      status,
      readAt: at,
      deliveredAt: message.deliveredAt ?? at,
      sentAt: message.sentAt || at,
      failedAt: null,
    }
  }
  return { ...message, status: 'failed', failedAt: at }
}
