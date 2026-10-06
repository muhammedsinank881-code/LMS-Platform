import type { Channel, Lead } from '@/types'
import type { RequestContext } from '../../core/context'
import { ensureConversation } from '../../resources/conversation-incoming'
import { sendOutbound } from '../../resources/conversations-send'
import { buildEnvelope } from '@/lib/webhooks/payload'
import { newId } from '../../core/util'
import { performAttempt } from '../../webhooks/deliver'
import { leadSnapshot } from '../../webhooks/dispatcher'
import { leadOf, type ExecutorGroup } from './types'

function sendTemplate(ctx: RequestContext, lead: Lead, channel: Extract<Channel, 'whatsapp' | 'email'>, templateId: string): string {
  const template = ctx.db.find('templates', templateId)
  if (!template) throw new Error('The template no longer exists.')
  const phone = lead.whatsapp ?? lead.phone
  if (channel === 'whatsapp' && !phone) throw new Error(`${lead.name} has no WhatsApp number.`)
  if (channel === 'whatsapp' && lead.whatsappOptOut) throw new Error(`${lead.name} opted out of WhatsApp.`)
  if (channel === 'email' && !lead.email) throw new Error(`${lead.name} has no email address.`)
  const conversation = ensureConversation(ctx, channel, lead, channel === 'whatsapp' ? phone : lead.phone, lead.email)
  sendOutbound(ctx, conversation, { body: '', templateId })
  return `Sent ${channel === 'whatsapp' ? 'WhatsApp' : 'email'} template "${template.name}" to ${lead.name}`
}

export const messageExecutors: ExecutorGroup<'send_whatsapp' | 'send_email' | 'call_webhook'> = {
  send_whatsapp: (ctx, action, target) => sendTemplate(ctx, leadOf(ctx, target), 'whatsapp', action.templateId),
  send_email: (ctx, action, target) => sendTemplate(ctx, leadOf(ctx, target), 'email', action.templateId),
  call_webhook: (ctx, action, target) => {
    const endpoint = ctx.db.find('webhooks', action.endpointId)
    if (!endpoint) throw new Error('The webhook endpoint no longer exists.')
    if (!endpoint.enabled || endpoint.status === 'paused') throw new Error('The webhook endpoint is paused or disabled.')
    const lead = target.leadId ? ctx.db.find('leads', target.leadId) : undefined
    const eventId = newId('evt')
    const body = JSON.stringify(buildEnvelope(eventId, 'automation.called', ctx.timestamp, lead ? { lead: leadSnapshot(ctx, lead) } : {}))
    const delivery = performAttempt(ctx, endpoint, { eventId, event: 'automation.called', body, attempt: 1 })
    if (delivery.status === 'failed') throw new Error(`The webhook failed (HTTP ${delivery.httpStatus ?? 'timeout'}).`)
    return `Called the webhook ${endpoint.url} (HTTP ${delivery.httpStatus ?? 'timeout'}${delivery.status === 'retrying' ? ', will retry' : ''})`
  },
}
