import { renderBroadcastBody, validateVariableMap } from '@/lib/inbox/broadcast-variables'
import { parseTemplateVariables } from '@/lib/inbox/template-variables'
import type { BroadcastsApiClient } from '@/services/api/broadcasts'
import type { Broadcast, BroadcastInput, MessageTemplate } from '@/types'
import { request, type RequestContext } from '../core/context'
import { recordActivity, recordAudit } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import { audienceLabel, audienceLeads, splitAudience, whatsappNumber } from './broadcast-audience'
import { ensureConversation } from './conversation-incoming'
import { leadCustomKeys, touchConversation, workspaceName } from './conversation-effects'

/** Leads sent per poll while a broadcast is running. */
export const BROADCAST_BATCH_SIZE = 10

const hashOf = (text: string) => [...text].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7)

function approvedWhatsAppTemplate(ctx: RequestContext, id: string): MessageTemplate {
  const template = ctx.db.find('templates', id)
  if (!template || template.channel !== 'whatsapp') throw validationError('templateId', 'Pick a WhatsApp template.')
  if (template.status !== 'approved') throw validationError('templateId', 'Only approved templates can be broadcast.')
  return template
}

/** Sends one batch to the next pending leads. The send is simulated: it only writes to the mock database. */
function sendBatch(ctx: RequestContext, broadcast: Broadcast): Broadcast {
  const template = ctx.db.find('templates', broadcast.templateId)
  const batch = broadcast.pendingLeadIds.slice(0, BROADCAST_BATCH_SIZE)
  const stats = { ...broadcast.stats }
  for (const leadId of batch) {
    const lead = ctx.db.find('leads', leadId)
    if (!lead || !template) {
      stats.failed += 1
      continue
    }
    const owner = lead.assignedTo ? ctx.db.find('users', lead.assignedTo) : null
    const { text } = renderBroadcastBody(template.body, broadcast.variableMap, {
      lead,
      owner,
      companyName: workspaceName(ctx),
    })
    const roll = hashOf(lead.id) % 100
    const failed = roll < 6
    const read = !failed && roll < 70
    const conversation = ensureConversation(ctx, 'whatsapp', lead, whatsappNumber(lead), lead.email)
    const message = ctx.db.insert('messages', {
      id: newId('msg'),
      conversationId: conversation.id,
      channel: 'whatsapp',
      direction: 'outbound',
      type: 'template',
      body: text,
      subject: null,
      status: failed ? 'failed' : read ? 'read' : 'delivered',
      attachments: [],
      durationSecs: null,
      templateId: template.id,
      senderId: broadcast.createdBy,
      isInternalNote: false,
      queuedAt: ctx.timestamp,
      sentAt: ctx.timestamp,
      deliveredAt: failed ? null : ctx.timestamp,
      readAt: read ? ctx.timestamp : null,
      failedAt: failed ? ctx.timestamp : null,
      openedAt: null,
      clickedAt: null,
    })
    touchConversation(ctx, conversation, message)
    recordActivity(ctx, lead.id, { type: 'whatsapp_sent', data: { body: text.slice(0, 90) } }, { actorId: broadcast.createdBy })
    if (failed) stats.failed += 1
    else {
      stats.sent += 1
      stats.delivered += 1
      if (read) stats.read += 1
      if (read && roll % 7 === 0) stats.replied += 1
    }
  }
  const pendingLeadIds = broadcast.pendingLeadIds.slice(batch.length)
  const done = pendingLeadIds.length === 0
  const saved = ctx.db.save('broadcasts', {
    ...broadcast,
    stats,
    pendingLeadIds,
    status: done ? 'completed' : 'sending',
    completedAt: done ? ctx.timestamp : null,
  })
  if (done) {
    recordAudit(ctx, {
      action: 'updated',
      entity: 'broadcast',
      entityId: saved.id,
      entityLabel: saved.name,
      newValue: { status: 'completed', sent: stats.sent, failed: stats.failed },
    })
  }
  return saved
}

/** Moves every running or due broadcast forward by one batch. Called whenever broadcasts are read. */
export function tickBroadcasts(ctx: RequestContext): void {
  for (const broadcast of ctx.db.all('broadcasts')) {
    const due =
      broadcast.status === 'scheduled' &&
      broadcast.schedule.at !== null &&
      Date.parse(broadcast.schedule.at) <= ctx.now.getTime()
    if (broadcast.status === 'sending' || due) sendBatch(ctx, broadcast)
  }
}

function validateInput(ctx: RequestContext, input: BroadcastInput, template: MessageTemplate): void {
  if (!input.name.trim()) throw validationError('name', 'Give the broadcast a name.')
  const variables = parseTemplateVariables(`${template.header ?? ''} ${template.body}`)
  const errors = validateVariableMap(variables, input.variableMap, leadCustomKeys(ctx))
  const [name, message] = Object.entries(errors)[0] ?? []
  if (name && message) throw validationError('variableMap', `${name}: ${message}`)
  if (input.schedule.mode === 'later') {
    const at = Date.parse(input.schedule.at ?? '')
    if (Number.isNaN(at) || at <= ctx.now.getTime()) throw validationError('schedule', 'Pick a time in the future.')
  }
}

function requireBroadcast(ctx: RequestContext, id: string): Broadcast {
  return ctx.db.get('broadcasts', id, 'Broadcast')
}

export const mockBroadcastsApi: BroadcastsApiClient = {
  list: () =>
    request((ctx) => {
      ctx.require('campaigns', 'view')
      tickBroadcasts(ctx)
      return ctx.db.all('broadcasts').sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }),
  get: (id) =>
    request((ctx) => {
      ctx.require('campaigns', 'view')
      tickBroadcasts(ctx)
      return requireBroadcast(ctx, id)
    }),
  audienceCount: (audience) =>
    request((ctx) => {
      ctx.require('campaigns', 'view')
      return splitAudience(audienceLeads(ctx, audience)).count
    }),
  preview: (templateId, variableMap, audience) =>
    request((ctx) => {
      ctx.require('campaigns', 'view')
      const template = ctx.db.find('templates', templateId)
      if (!template) throw validationError('templateId', 'Pick a template.')
      const lead = splitAudience(audienceLeads(ctx, audience)).eligible[0]
      const owner = lead?.assignedTo ? ctx.db.find('users', lead.assignedTo) : ctx.actor
      const { text } = renderBroadcastBody(template.body, variableMap, {
        lead,
        owner,
        companyName: workspaceName(ctx),
        fallbacks: template.sampleValues,
      })
      return { leadName: lead?.name ?? 'Sample lead', text }
    }),
  create: (input) =>
    request((ctx) => {
      ctx.require('campaigns', 'create')
      ctx.requireFeature('send-broadcasts')
      const template = approvedWhatsAppTemplate(ctx, input.templateId)
      validateInput(ctx, input, template)
      const { eligible, count } = splitAudience(audienceLeads(ctx, input.audience))
      if (eligible.length === 0) throw validationError('audience', 'No leads in this audience can be messaged.')
      const later = input.schedule.mode === 'later'
      const broadcast = ctx.db.insert('broadcasts', {
        id: newId('bcast'),
        name: input.name.trim(),
        templateId: template.id,
        audience: input.audience,
        audienceLabel: audienceLabel(ctx, input.audience),
        variableMap: input.variableMap,
        schedule: { mode: input.schedule.mode, at: later ? input.schedule.at : null },
        status: later ? 'scheduled' : 'sending',
        stats: { total: eligible.length, sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 },
        excludedOptOut: count.optedOut,
        pendingLeadIds: eligible.map((lead) => lead.id),
        createdBy: ctx.actor.id,
        createdAt: ctx.timestamp,
        completedAt: null,
      })
      recordAudit(ctx, {
        action: 'created',
        entity: 'broadcast',
        entityId: broadcast.id,
        entityLabel: broadcast.name,
        newValue: { audience: broadcast.audienceLabel, recipients: eligible.length, optedOut: count.optedOut },
      })
      return broadcast
    }),
  cancel: (id) =>
    request((ctx) => {
      ctx.require('campaigns', 'edit')
      ctx.requireFeature('send-broadcasts')
      const broadcast = requireBroadcast(ctx, id)
      if (broadcast.status === 'completed' || broadcast.status === 'cancelled') {
        throw validationError('status', 'This broadcast has already finished.')
      }
      const saved = ctx.db.save('broadcasts', { ...broadcast, status: 'cancelled', pendingLeadIds: [] })
      recordAudit(ctx, {
        action: 'updated',
        entity: 'broadcast',
        entityId: id,
        entityLabel: broadcast.name,
        previousValue: { status: broadcast.status },
        newValue: { status: 'cancelled' },
      })
      return saved
    }),
}
