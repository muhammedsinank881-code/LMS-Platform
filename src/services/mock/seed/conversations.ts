import { windowExpiresAtFrom } from '@/lib/inbox/whatsapp-window'
import type { CallLog, Channel, Conversation, Lead, Message, MessageStatus } from '@/types'
import type { SeedContext } from './context'
import { CALL_NOTES, EMAIL_SCRIPTS, WHATSAPP_SCRIPTS } from './indian-chat'
import { fillTemplate } from './indian-data'
import { DAY, HOUR, MINUTE, chance, int, pick, sample, scaled, seedId, type SeedEnv } from './rng'

const CHANNEL_PLAN: Array<[Channel, number]> = [
  ['whatsapp', 9],
  ['email', 4],
  ['call', 2],
]

interface Line {
  direction: Message['direction']
  body: string
  subject: string | null
}

function scriptFor(env: SeedEnv, channel: Channel, lead: Lead, index: number): Line[] {
  const values = {
    name: lead.name.split(' ')[0],
    product: lead.productInterest ?? 'our service',
    city: lead.location ?? 'your city',
  }
  const fill = (text: string) => fillTemplate(text, values)
  if (channel === 'whatsapp') {
    return WHATSAPP_SCRIPTS[index % WHATSAPP_SCRIPTS.length].map(([dir, text]) => ({
      direction: dir === 'in' ? 'inbound' : 'outbound',
      body: fill(text),
      subject: null,
    }))
  }
  if (channel === 'email') {
    return EMAIL_SCRIPTS[index % EMAIL_SCRIPTS.length].map(([dir, subject, text]) => ({
      direction: dir === 'in' ? 'inbound' : 'outbound',
      body: fill(text),
      subject: fill(subject),
    }))
  }
  return [{ direction: 'outbound', body: pick(env, CALL_NOTES), subject: null }]
}

function statusFor(env: SeedEnv, inbound: boolean): MessageStatus {
  if (inbound) return 'read'
  return chance(env, 0.7) ? 'read' : 'delivered'
}

export function buildConversations(
  env: SeedEnv,
  ctx: SeedContext,
): { conversations: Conversation[]; messages: Message[]; callLogs: CallLog[] } {
  const now = env.now.getTime()
  const candidates = ctx.leads.filter(
    (lead) => !lead.archivedAt && lead.assignedTo !== null && (lead.phone || lead.email),
  )
  const chosen = sample(
    env,
    candidates,
    CHANNEL_PLAN.reduce((sum, [, count]) => sum + scaled(env, count, 1), 0),
  )

  const conversations: Conversation[] = []
  const messages: Message[] = []
  const callLogs: CallLog[] = []
  let cursor = 0

  for (const [channel, planned] of CHANNEL_PLAN) {
    for (let i = 0; i < scaled(env, planned, 1); i++) {
      const lead = chosen[cursor++]
      if (!lead) break
      const lines = scriptFor(env, channel, lead, cursor)
      const gaps = lines.map(() => int(env, 3 * MINUTE, 90 * MINUTE))
      const span = gaps.reduce((sum, gap) => sum + gap, 0)
      const startsAt = Math.min(now - span - MINUTE, now - int(env, 2 * HOUR, 6 * DAY))
      const conversationId = seedId(env, 'conv', conversations.length + 1)

      let at = startsAt
      const thread = lines.map((line, index): Message => {
        at += gaps[index]
        const inbound = line.direction === 'inbound'
        const status = statusFor(env, inbound)
        const sentAt = new Date(at).toISOString()
        const attachments =
          !inbound && channel === 'whatsapp' && index === 3
            ? [{ name: 'Quotation.pdf', kind: 'document' as const, sizeKb: int(env, 80, 900) }]
            : []
        return {
          id: seedId(env, 'msg', messages.length + index + 1),
          tenantId: env.tenantId,
          conversationId,
          channel,
          direction: line.direction,
          type: attachments[0]?.kind ?? 'text',
          body: line.body,
          subject: line.subject,
          status,
          attachments,
          durationSecs: channel === 'call' ? int(env, 60, 600) : null,
          templateId: null,
          senderId: inbound ? null : lead.assignedTo,
          isInternalNote: false,
          queuedAt: inbound ? null : sentAt,
          sentAt,
          deliveredAt: status === 'sent' ? null : sentAt,
          readAt: status === 'read' ? sentAt : null,
          failedAt: null,
          openedAt: !inbound && channel === 'email' && i === 0 ? sentAt : null,
          clickedAt: null,
        }
      })
      messages.push(...thread)

      const last = thread[thread.length - 1]
      const lastInbound = [...thread].reverse().find((item) => item.direction === 'inbound')
      let windowExpiresAt: string | null = null
      if (channel === 'whatsapp') {
        if (i === 0 && lastInbound) windowExpiresAt = new Date(now + 40 * MINUTE).toISOString()
        else if (i === 1) windowExpiresAt = new Date(now - 3 * HOUR).toISOString()
        else if (lastInbound) windowExpiresAt = windowExpiresAtFrom(lastInbound.sentAt)
      }

      conversations.push({
        id: conversationId,
        tenantId: env.tenantId,
        leadId: lead.id,
        channel,
        assignedTo: lead.assignedTo,
        status: 'open',
        contactName: lead.name,
        contactPhone: lead.whatsapp ?? lead.phone,
        contactEmail: lead.email,
        subject: thread[0].subject ?? null,
        lastMessageAt: last.sentAt,
        lastMessagePreview: last.body.slice(0, 90),
        unreadCount: last.direction === 'inbound' && chance(env, 0.6) ? int(env, 1, 3) : 0,
        windowExpiresAt,
        emailDraft: null,
        createdAt: thread[0].sentAt,
      })

      if (channel === 'call') {
        callLogs.push({
          id: seedId(env, 'call', callLogs.length + 1),
          tenantId: env.tenantId,
          leadId: lead.id,
          conversationId,
          direction: 'outbound',
          durationSecs: thread[0].durationSecs ?? 120,
          outcome: chance(env, 0.7) ? 'connected' : 'no_answer',
          notes: thread[0].body,
          recordingUrl: `mock://recording/${conversationId}`,
          userId: lead.assignedTo ?? ctx.users[0].id,
          startedAt: thread[0].sentAt,
        })
      }
    }
  }

  const unknownId = seedId(env, 'conv', conversations.length + 1)
  const unknownAt = new Date(now - 2 * HOUR).toISOString()
  conversations.push({
    id: unknownId,
    tenantId: env.tenantId,
    leadId: null,
    channel: 'whatsapp',
    assignedTo: null,
    status: 'open',
    contactName: null,
    contactPhone: '+919876500000',
    contactEmail: null,
    subject: null,
    lastMessageAt: unknownAt,
    lastMessagePreview: 'Hi, I saw your ad. Can someone call me?',
    unreadCount: 1,
    windowExpiresAt: windowExpiresAtFrom(unknownAt),
    emailDraft: null,
    createdAt: unknownAt,
  })
  messages.push({
    id: seedId(env, 'msg', messages.length + 1),
    tenantId: env.tenantId,
    conversationId: unknownId,
    channel: 'whatsapp',
    direction: 'inbound',
    type: 'text',
    body: 'Hi, I saw your ad. Can someone call me?',
    subject: null,
    status: 'delivered',
    attachments: [],
    durationSecs: null,
    templateId: null,
    senderId: null,
    isInternalNote: false,
    queuedAt: null,
    sentAt: unknownAt,
    deliveredAt: unknownAt,
    readAt: null,
    failedAt: null,
    openedAt: null,
    clickedAt: null,
  })

  return { conversations, messages, callLogs }
}
