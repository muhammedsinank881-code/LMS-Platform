import { ApiError } from '@/services/api/errors'
import {
  INTEGRATION_PROVIDER_LABEL,
  type FieldMapping,
  type Integration,
  type IntegrationProvider,
  type LeadAdsConfig,
  type LeadFormMapping,
  type IngestPayload,
  type LeadDefaults,
  type SendTestLeadResult,
} from '@/types'
import type { RequestContext } from '../core/context'
import { notify } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import { ingestLead } from '../ingest/ingest-lead'
import { systemActorContext } from '../core/system-actor'
import { getIntegration, isLeadAds } from './connect'
import { logEvent, notifyAdmins } from './support'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function requireConnected(ctx: RequestContext, provider: IntegrationProvider): Integration {
  const row = getIntegration(ctx, provider)
  if (row.status !== 'connected') {
    throw new ApiError('CONFLICT', `${INTEGRATION_PROVIDER_LABEL[provider]} is not connected.`)
  }
  return row
}

export function verifyWebhook(ctx: RequestContext): Integration {
  const row = requireConnected(ctx, 'whatsapp')
  if (row.config?.provider !== 'whatsapp' || !row.config.verifyToken) throw validationError('verifyToken', 'Add a verify token first.')
  const saved = ctx.db.save('integrations', {
    ...row,
    config: { ...row.config, webhookVerified: true },
    health: { checkedAt: ctx.timestamp, ok: true, latencyMs: 96, details: ['Webhook verified', 'Callback reachable'] },
  })
  logEvent(ctx, saved, 'sync_ok', 'Webhook verified')
  return saved
}

export function syncTemplates(ctx: RequestContext): { count: number } {
  const row = requireConnected(ctx, 'whatsapp')
  if (row.config?.provider !== 'whatsapp') throw validationError('provider', 'WhatsApp is not configured.')
  const count = ctx.db.all('templates').filter((template) => template.channel === 'whatsapp').length
  ctx.db.save('integrations', { ...row, config: { ...row.config, templatesSyncedAt: ctx.timestamp }, lastSyncAt: ctx.timestamp })
  logEvent(ctx, row, 'sync_ok', `Synced ${count} message templates`)
  return { count }
}

export function sendTestEmail(ctx: RequestContext, to: string): { sentTo: string } {
  const row = requireConnected(ctx, 'email')
  const address = to.trim()
  if (!EMAIL.test(address)) throw validationError('to', 'Enter a valid email address.')
  if (row.config?.provider !== 'email') throw validationError('provider', 'Email is not configured.')
  ctx.db.save('integrations', { ...row, config: { ...row.config, testSentAt: ctx.timestamp }, lastSyncAt: ctx.timestamp })
  logEvent(ctx, row, 'message_sent', `Test email sent to ${address}`)
  return { sentTo: address }
}

const DEFAULT_QUESTIONS = ['full_name', 'phone_number', 'email']
const DEFAULT_MAPPING: FieldMapping[] = [
  { sourceField: 'full_name', leadField: 'name' },
  { sourceField: 'phone_number', leadField: 'phone' },
  { sourceField: 'email', leadField: 'email' },
]
const NO_DEFAULTS: LeadDefaults = { sourceId: null, campaignId: null, statusId: null, tags: [], assignMode: 'rules', assignUserId: null }

export function sampleValue(leadField: string | undefined, seq: string): string {
  switch (leadField) {
    case 'name': return `Test Lead ${seq}`
    case 'phone':
    case 'whatsapp': return `+9198${seq.padStart(8, '0').slice(-8)}`
    case 'email': return `test.lead.${seq}@example.com`
    case 'company': return 'Test Traders'
    case 'location': return 'Pune'
    case 'budget': return '75000'
    case 'productInterest': return 'Demo'
    case 'requirement': return 'Test lead sent from LeadFlow'
    default: return 'Sample answer'
  }
}

function sampleFor(leadField: string | undefined, seq: string, customSample: (leadField: string) => string): string {
  return leadField?.startsWith('custom.') ? customSample(leadField) : sampleValue(leadField, seq)
}

function adPayload(
  provider: IntegrationProvider,
  form: Pick<LeadFormMapping, 'formId' | 'questions' | 'fields'>,
  seq: string,
  customSample: (leadField: string) => string,
): IngestPayload {
  const questions = form.questions.length > 0 ? form.questions : form.fields.map((field) => field.sourceField)
  const answers = questions.map((question) => ({
    question,
    answer: sampleFor(form.fields.find((field) => field.sourceField === question)?.leadField, seq, customSample),
  }))
  if (provider === 'google_ads') {
    return { shape: 'google', formId: form.formId, userColumnData: answers.map((a) => ({ columnId: a.question, stringValue: a.answer })) }
  }
  if (provider === 'linkedin') return { shape: 'linkedin', formId: form.formId, answers }
  return { shape: 'meta', formId: form.formId, fieldData: answers.map((a) => ({ name: a.question, values: [a.answer] })) }
}

/** Creates a lead as the provider's webhook would, through the real ingestion pipeline. */
export function sendTestLead(ctx: RequestContext, provider: IntegrationProvider, formId?: string): SendTestLeadResult {
  if (!isLeadAds(provider)) throw validationError('provider', 'This integration does not receive lead forms.')
  const row = requireConnected(ctx, provider)
  const config = row.config as (LeadAdsConfig & { provider: typeof provider }) | null
  const form = config?.forms.find((item) => item.formId === formId) ?? config?.forms[0]
  const seq = String(Date.now() % 100_000_000)
  const mapping = form?.fields ?? DEFAULT_MAPPING
  const customSample = (leadField: string): string => {
    const definition = ctx.db.all('customFields').find((item) => item.entity === 'lead' && `custom.${item.key}` === leadField)
    if (definition?.type === 'number' || definition?.type === 'currency') return '10'
    if (definition?.type === 'boolean') return 'yes'
    if (definition?.type === 'dropdown' || definition?.type === 'multiselect') return definition.options[0] ?? 'Sample answer'
    return 'Sample answer'
  }
  const payload = adPayload(provider, form ?? { formId: 'default', questions: DEFAULT_QUESTIONS, fields: DEFAULT_MAPPING }, seq, customSample)
  const result = ingestLead(systemActorContext(ctx, INTEGRATION_PROVIDER_LABEL[provider]), payload, {
    provider,
    integrationId: row.id,
    mapping,
    defaults: form?.defaults ?? NO_DEFAULTS,
  })
  return { leadId: result.leadId, duplicate: result.duplicates.length > 0 }
}

export function testCall(ctx: RequestContext): { callLogId: string } {
  const row = requireConnected(ctx, 'telephony')
  const lead = [...ctx.db.all('leads')]
    .filter((item) => item.phone && !item.archivedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
  const log = ctx.db.insert('callLogs', {
    id: newId('call'),
    leadId: lead?.id ?? null,
    conversationId: null,
    direction: 'outbound',
    durationSecs: 42,
    outcome: 'connected',
    notes: 'Test call from the telephony integration (simulated)',
    recordingUrl: null,
    userId: ctx.actor.id,
    startedAt: ctx.timestamp,
  })
  ctx.db.save('integrations', { ...row, lastSyncAt: ctx.timestamp })
  logEvent(ctx, row, 'sync_ok', 'Test call logged')
  return { callLogId: log.id }
}

const dayBefore = (ctx: RequestContext) => new Date(ctx.now.getTime() - 86_400_000).toISOString().slice(0, 10)

/** Creates yesterday's spend for active Google Ads campaigns, once per campaign and day. */
export function syncSpend(ctx: RequestContext): { created: number } {
  const row = requireConnected(ctx, 'google_ads')
  if (row.config?.provider !== 'google_ads' || !row.config.syncSpend) {
    throw validationError('syncSpend', 'Turn on spend sync first.')
  }
  const date = dayBefore(ctx)
  const currency = ctx.db.find('tenantSettings', ctx.tenantId)?.workspace.currency ?? 'INR'
  const existing = new Set(ctx.db.all('spendEntries').filter((entry) => entry.source === 'synced' && entry.date === date).map((entry) => entry.campaignId))
  let created = 0
  for (const campaign of ctx.db.all('campaigns')) {
    if (campaign.platform !== 'google_ads' || campaign.status !== 'active' || campaign.archivedAt || existing.has(campaign.id)) continue
    const hash = [...campaign.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)
    ctx.db.insert('spendEntries', {
      id: newId('spend'),
      campaignId: campaign.id,
      adSetId: null,
      adId: null,
      date,
      amount: 500 + (hash % 1500),
      currency,
      source: 'synced',
      notes: 'Synced from Google Ads (simulated)',
    })
    created += 1
  }
  ctx.db.save('integrations', { ...row, lastSyncAt: ctx.timestamp })
  logEvent(ctx, row, 'sync_ok', created > 0 ? `Synced spend for ${created} campaigns` : 'Spend already up to date')
  return { created }
}

const FAILURE_COPY: Record<IntegrationProvider, { message: string; fix: string }> = {
  whatsapp: { message: 'Meta rejected the request: the access token is invalid.', fix: 'Generate a new system user token and reconnect.' },
  email: { message: 'The mail server refused the sign-in.', fix: 'Check the password or re-authorise the mailbox.' },
  facebook_lead_ads: { message: 'Facebook could not read the page leads.', fix: 'Reconnect and approve the lead access permission for the page.' },
  instagram: { message: 'Instagram could not read the linked page leads.', fix: 'Reconnect and approve lead access.' },
  google_ads: { message: 'Google Ads rejected the request.', fix: 'Reconnect the account and confirm access to the ad account.' },
  linkedin: { message: 'LinkedIn rejected the request.', fix: 'Reconnect and approve the Lead Gen Forms permission.' },
  telephony: { message: 'The telephony provider is not responding.', fix: 'Check the provider status page, then reconnect.' },
  website: { message: 'The tracking snippet was not found on your site.', fix: 'Re-install the snippet and reconnect.' },
}

/** Breaks a connected integration (error) or expires its token. Dev simulator only. */
export function failIntegration(ctx: RequestContext, provider: IntegrationProvider, kind: 'error' | 'expired'): Integration {
  const row = requireConnected(ctx, provider)
  const copy = FAILURE_COPY[provider]
  const label = INTEGRATION_PROVIDER_LABEL[provider]
  const message = kind === 'expired' ? `The ${label} access token has expired.` : copy.message
  const saved = ctx.db.save('integrations', {
    ...row,
    status: kind,
    error: { kind, message, suggestedFix: kind === 'expired' ? 'Reconnect to issue a new token.' : copy.fix, occurredAt: ctx.timestamp },
    health: { checkedAt: ctx.timestamp, ok: false, latencyMs: null, details: [message] },
  })
  logEvent(ctx, saved, 'error', message)
  notifyAdmins(ctx, `${label} needs attention`, message, '/settings/integrations')
  if (row.connectedBy) notify(ctx, row.connectedBy, { type: 'integration_alert', title: `${label} needs attention`, body: message, link: '/settings/integrations' }, { includeActor: true })
  return saved
}

