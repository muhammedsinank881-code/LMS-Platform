import type { MessageTemplate, QuickReply, TemplateCategory, TemplateChannel } from '@/types'
import { parseTemplateVariables } from '@/lib/inbox/template-variables'
import { seedId, type SeedEnv } from './rng'

type TemplateDef = [
  slug: string,
  name: string,
  channel: TemplateChannel,
  category: TemplateCategory,
  body: string,
  extras?: { subject?: string; header?: string; footer?: string; status?: MessageTemplate['status']; reason?: string },
]

const TEMPLATE_DEFS: TemplateDef[] = [
  [
    'wa-welcome',
    'WhatsApp: Welcome',
    'whatsapp',
    'utility',
    'Namaste {{lead.name}}! Thanks for your interest. How can we help you today?',
    { header: 'LeadFlow', footer: 'Reply STOP to opt out' },
  ],
  [
    'wa-followup',
    'WhatsApp: Follow-up',
    'whatsapp',
    'utility',
    'Hi {{lead.name}}, just checking in. Do you have any questions for {{owner.name}}?',
  ],
  [
    'wa-quote',
    'WhatsApp: Quotation',
    'whatsapp',
    'marketing',
    'Hi {{lead.name}}, the quotation for {{company.name}} is ready. Happy to walk you through it.',
  ],
  [
    'wa-auth',
    'WhatsApp: Verification',
    'whatsapp',
    'authentication',
    'Your LeadFlow verification code is ready, {{lead.name}}.',
    { status: 'pending' },
  ],
  [
    'wa-rejected',
    'WhatsApp: Festival offer',
    'whatsapp',
    'marketing',
    'Hi {{lead.name}}, a limited offer is available for {{company.name}} this week.',
    { status: 'rejected', reason: 'Promotional language needs a sample value for every variable.' },
  ],
  [
    'em-intro',
    'Email: Introduction',
    'email',
    'utility',
    'Dear {{lead.name}}, thank you for enquiring. Here is a short overview of how we work.',
    { subject: 'Thanks for your interest, {{lead.name}}' },
  ],
  [
    'em-proposal',
    'Email: Proposal',
    'email',
    'marketing',
    'Dear {{lead.name}}, please find our proposal for {{company.name}} attached.',
    { subject: 'Proposal for {{company.name}}' },
  ],
  [
    'em-thanks',
    'Email: Onboarding',
    'email',
    'utility',
    'Dear {{lead.name}}, welcome! {{owner.name}} will be your point of contact.',
    { subject: 'Welcome to LeadFlow' },
  ],
]

export function buildTemplates(env: SeedEnv, createdBy: string): MessageTemplate[] {
  const createdAt = new Date(env.now.getTime() - 120 * 86_400_000).toISOString()
  return TEMPLATE_DEFS.map(([slug, name, channel, category, body, extras]) => ({
    id: seedId(env, 'tpl', slug),
    tenantId: env.tenantId,
    name,
    channel,
    category,
    language: 'en',
    body,
    subject: extras?.subject ?? null,
    header: extras?.header ?? null,
    footer: extras?.footer ?? null,
    buttons: [],
    variables: parseTemplateVariables(`${extras?.subject ?? ''} ${extras?.header ?? ''} ${body} ${extras?.footer ?? ''}`),
    sampleValues: { 'lead.name': 'Riya', 'company.name': 'Shah Traders', 'owner.name': 'Ananya' },
    status: extras?.status ?? 'approved',
    rejectionReason: extras?.reason ?? null,
    createdBy,
    createdAt,
    updatedAt: createdAt,
  }))
}

const QUICK_REPLIES: Array<[string, string, string]> = [
  ['pricing', '/pricing', 'Our packages start from a monthly retainer. I can share a one-pager if that helps.'],
  ['intro', '/intro', 'Namaste! Thanks for writing in. How can I help you today?'],
  ['followup', '/followup', 'Just checking in — would you like to schedule a quick call this week?'],
]

export function buildQuickReplies(env: SeedEnv, createdBy: string): QuickReply[] {
  const createdAt = new Date(env.now.getTime() - 90 * 86_400_000).toISOString()
  return QUICK_REPLIES.map(([slug, shortcut, body]) => ({
    id: seedId(env, 'qr', slug),
    tenantId: env.tenantId,
    shortcut,
    body,
    channel: null,
    createdBy,
    createdAt,
    updatedAt: createdAt,
  }))
}
