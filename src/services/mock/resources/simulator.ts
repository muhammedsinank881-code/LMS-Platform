import type { SimulatorApiClient } from '@/services/api/simulator'
import type { MessageStatus } from '@/types'
import { emit } from '../automation/event-bus'
import { tickAutomations } from '../automation/scheduler'
import { advanceMockClock, getMockClockOffset, getMockNow, resetMockClock } from '../config'
import { request } from '../core/context'
import { recordActivity } from '../core/records'
import { validationError } from '../core/validate'
import { applyDeliveryStatus, resolveTemplateReview, tickInbox } from './conversations-access'
import { ensureConversation, insertInboundMessage, resolveIncomingContact } from './conversation-incoming'
import { mockCallLogsApi } from './call-logs'
import { captureSimulator } from './simulator-capture'

const DELIVERY: readonly MessageStatus[] = ['queued', 'sent', 'delivered', 'read', 'failed']

export const mockSimulatorApi: SimulatorApiClient = {
  ...captureSimulator,
  incomingWhatsApp: (input) =>
    request((ctx) => {
      tickInbox(ctx)
      const body = input.body.trim()
      if (!body) throw validationError('body', 'Write a message first.')
      const contact = resolveIncomingContact(ctx, { leadId: input.leadId, phone: input.phone })
      const conversation = ensureConversation(ctx, 'whatsapp', contact.lead, contact.phone, contact.email)
      const message = insertInboundMessage(ctx, conversation, { body })
      return { conversation: ctx.db.get('conversations', conversation.id, 'Conversation'), message }
    }),
  incomingEmail: (input) =>
    request((ctx) => {
      tickInbox(ctx)
      const body = input.body.trim()
      if (!body) throw validationError('body', 'Write a message first.')
      const contact = resolveIncomingContact(ctx, { leadId: input.leadId, email: input.email })
      const conversation = ensureConversation(ctx, 'email', contact.lead, contact.phone, contact.email)
      const message = insertInboundMessage(ctx, conversation, { body, subject: input.subject })
      return { conversation: ctx.db.get('conversations', conversation.id, 'Conversation'), message }
    }),
  setDeliveryStatus: (messageId, status) =>
    request((ctx) => {
      if (!DELIVERY.includes(status)) throw validationError('status', 'Unknown delivery status.')
      const message = ctx.db.get('messages', messageId, 'Message')
      return ctx.db.save('messages', applyDeliveryStatus(message, status, ctx.timestamp))
    }),
  emailOpened: (messageId) =>
    request((ctx) => {
      const message = ctx.db.get('messages', messageId, 'Message')
      if (message.channel !== 'email' || message.direction !== 'outbound') {
        throw validationError('messageId', 'Pick a sent email.')
      }
      return ctx.db.save('messages', { ...message, openedAt: message.openedAt ?? ctx.timestamp })
    }),
  emailClicked: (messageId) =>
    request((ctx) => {
      const message = ctx.db.get('messages', messageId, 'Message')
      if (message.channel !== 'email' || message.direction !== 'outbound') {
        throw validationError('messageId', 'Pick a sent email.')
      }
      return ctx.db.save('messages', {
        ...message,
        openedAt: message.openedAt ?? ctx.timestamp,
        clickedAt: message.clickedAt ?? ctx.timestamp,
      })
    }),
  missedCall: (input) =>
    request(async (ctx) => {
      const contact = resolveIncomingContact(ctx, { leadId: input.leadId, phone: input.phone })
      const conversation = ensureConversation(ctx, 'call', contact.lead, contact.phone, contact.email)
      const callLog = await mockCallLogsApi.create({
        leadId: contact.lead?.id ?? null,
        conversationId: conversation.id,
        direction: 'inbound',
        durationSecs: 0,
        outcome: 'no_answer',
        notes: 'Missed call (simulator)',
      })
      return { conversation: ctx.db.get('conversations', conversation.id, 'Conversation'), callLog }
    }),
  recentOutbound: () =>
    request((ctx) => {
      tickInbox(ctx)
      return ctx.db
        .all('messages')
        .filter((message) => message.direction === 'outbound' && !message.isInternalNote && message.channel !== 'call')
        .sort((a, b) => b.sentAt.localeCompare(a.sentAt))
        .slice(0, 12)
        .map((message) => {
          const conversation = ctx.db.find('conversations', message.conversationId)
          return {
            id: message.id,
            channel: message.channel,
            status: message.status,
            contact: conversation?.contactName ?? conversation?.contactPhone ?? conversation?.contactEmail ?? 'Unknown',
            preview: (message.subject ?? message.body).replace(/<[^>]+>/g, ' ').trim().slice(0, 48),
            sentAt: message.sentAt,
          }
        })
    }),
  resolveTemplate: (input) =>
    request((ctx) => {
      const template = ctx.db.get('templates', input.id, 'Template')
      if (template.status !== 'pending' && template.status !== 'rejected') {
        throw validationError('id', 'Only a pending or rejected template can be resolved.')
      }
      if (input.outcome === 'rejected' && !input.reason?.trim()) {
        throw validationError('reason', 'Add a rejection reason.')
      }
      return resolveTemplateReview(ctx, template, input.outcome, input.outcome === 'rejected' ? (input.reason ?? '').trim() : null)
    }),
  engagement: (input) =>
    request((ctx) => {
      const lead = ctx.db.get('leads', input.leadId, 'Lead')
      const base = lead.engagement ?? {
        whatsappReplies: 0,
        emailOpens: 0,
        demosAttended: 0,
        quotationRequests: 0,
        formSubmissions: 0,
        websiteVisits: 0,
        lastActivityAt: null,
      }
      ctx.db.save('leads', {
        ...lead,
        engagement: { ...base, [input.signal]: base[input.signal] + 1, lastActivityAt: ctx.timestamp },
      })
      emit(ctx, { type: 'engagement', entity: { kind: 'lead', id: lead.id }, data: { signal: input.signal } })
    }),
  submitForm: (input) =>
    request((ctx) => {
      const lead = ctx.db.get('leads', input.leadId, 'Lead')
      const text = `Submitted the "${input.formId}" form (simulator)`
      recordActivity(ctx, lead.id, { type: 'note', data: { text } }, { actorId: null })
      emit(ctx, { type: 'form_submitted', entity: { kind: 'lead', id: lead.id }, data: { formId: input.formId } })
    }),
  advanceClock: async (minutes) => {
    if (!(minutes > 0)) throw validationError('minutes', 'Enter a number of minutes above zero.')
    advanceMockClock(minutes * 60_000)
    return request((ctx) => {
      tickAutomations(ctx, true)
      return { offsetMs: getMockClockOffset(), now: ctx.timestamp }
    })
  },
  resetClock: async () => {
    resetMockClock()
    return request((ctx) => ({ offsetMs: 0, now: ctx.timestamp }))
  },
  getClock: () => request(() => ({ offsetMs: getMockClockOffset(), now: getMockNow().toISOString() })),
}
