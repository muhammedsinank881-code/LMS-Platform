import { samplePayload } from '@/lib/webhooks/payload'
import { signPayload } from '@/lib/webhooks/signature'
import {
  INTEGRATION_PROVIDERS,
  type ApiKey,
  type Campaign,
  type FormSubmission,
  type Integration,
  type IntegrationConfig,
  type IntegrationEvent,
  type IntegrationProvider,
  type Lead,
  type LeadDefaults,
  type LeadForm,
  type LeadSource,
  type User,
  type WebhookDelivery,
  type WebhookEndpoint,
} from '@/types'
import { emptyIntegration } from '../integrations/support'
import { seedId, type SeedEnv } from './rng'

const HOUR = 3_600_000

export interface CaptureSeed {
  integrations: Integration[]
  integrationEvents: IntegrationEvent[]
  leadForms: LeadForm[]
  formSubmissions: FormSubmission[]
  apiKeys: ApiKey[]
  webhooks: WebhookEndpoint[]
  webhookDeliveries: WebhookDelivery[]
  /** Signing secrets by endpoint id, for the mock-only vault. */
  vault: Record<string, string>
}

const iso = (env: SeedEnv, hoursAgo: number) => new Date(env.now.getTime() - hoursAgo * HOUR).toISOString()

function leadAdsConfig(provider: 'facebook_lead_ads' | 'google_ads', defaults: LeadDefaults): IntegrationConfig {
  const mapping = [
    { sourceField: 'full_name', leadField: 'name' },
    { sourceField: 'phone_number', leadField: 'phone' },
    { sourceField: 'email', leadField: 'email' },
    { sourceField: 'budget', leadField: 'budget' },
  ]
  return {
    provider,
    pageId: provider === 'google_ads' ? null : '102938475610',
    pageName: provider === 'google_ads' ? null : 'Acme Home Interiors',
    accountIds: provider === 'google_ads' ? ['123-456-7890'] : [],
    forms: [
      {
        formId: provider === 'google_ads' ? 'gads-form-1' : 'fb-form-1',
        formName: provider === 'google_ads' ? 'Search lead extension' : 'Diwali offer lead form',
        questions: mapping.map((item) => item.sourceField),
        fields: mapping,
        defaults,
      },
    ],
    syncCampaigns: true,
    syncSpend: provider === 'google_ads',
    lastLeadAt: null,
  }
}

function buildIntegrations(env: SeedEnv, adminId: string, sources: LeadSource[]): Pick<CaptureSeed, 'integrations' | 'integrationEvents'> {
  const sourceId = (key: string) => sources.find((source) => source.key === key)?.id ?? null
  const defaults = (key: string): LeadDefaults => ({ sourceId: sourceId(key), campaignId: null, statusId: null, tags: [], assignMode: 'rules', assignUserId: null })
  const configs: Partial<Record<IntegrationProvider, IntegrationConfig>> = {
    whatsapp: {
      provider: 'whatsapp',
      businessAccountId: '1098765432101',
      phoneNumberId: '1056789012345',
      displayName: 'Acme Support',
      quality: 'green',
      token: { masked: '••••k29x' },
      verifyToken: 'vf_acme_demo_token',
      callbackUrl: `https://api.leadflow.example/webhooks/whatsapp/${env.tenantId}`,
      webhookVerified: true,
      templatesSyncedAt: iso(env, 30),
    },
    email: {
      provider: 'email',
      mailProvider: 'google',
      fromName: 'Acme Sales',
      fromEmail: 'sales@acme.example',
      signature: 'Warm regards,\nAcme Sales Team',
      trackOpens: true,
      trackClicks: false,
      password: null,
      testSentAt: iso(env, 70),
    },
    facebook_lead_ads: leadAdsConfig('facebook_lead_ads', defaults('facebook')),
    instagram: { ...(leadAdsConfig('facebook_lead_ads', defaults('instagram')) as IntegrationConfig & { provider: 'facebook_lead_ads' }), provider: 'instagram' },
    google_ads: leadAdsConfig('google_ads', defaults('google_ads')),
    website: { provider: 'website', domain: 'acme.example', snippetInstalled: true },
  }
  const status: Partial<Record<IntegrationProvider, Integration['status']>> = {
    whatsapp: 'connected',
    email: 'connected',
    facebook_lead_ads: 'connected',
    instagram: 'expired',
    google_ads: 'error',
    website: 'connected',
  }
  const errorCopy = {
    instagram: { kind: 'expired' as const, message: 'The Instagram Lead Ads access token has expired.', suggestedFix: 'Reconnect to issue a new token.' },
    google_ads: { kind: 'error' as const, message: 'Google Ads rejected the request.', suggestedFix: 'Reconnect the account and confirm access to the ad account.' },
  }
  const integrations: Integration[] = []
  const events: IntegrationEvent[] = []
  for (const provider of INTEGRATION_PROVIDERS) {
    const base = { ...emptyIntegration(provider), tenantId: env.tenantId }
    const current = status[provider] ?? 'not_connected'
    if (current === 'not_connected') {
      integrations.push(base)
      continue
    }
    const broken = provider === 'instagram' || provider === 'google_ads' ? errorCopy[provider] : null
    integrations.push({
      ...base,
      status: current,
      connectedBy: adminId,
      connectedAt: iso(env, 24 * 20),
      accountLabel: provider === 'whatsapp' ? '+91 98765 43210' : provider === 'email' ? 'sales@acme.example' : provider === 'website' ? 'acme.example' : 'Acme Home Interiors',
      lastSyncAt: iso(env, broken ? 36 : 2),
      config: configs[provider] ?? null,
      health: broken
        ? { checkedAt: iso(env, 6), ok: false, latencyMs: null, details: [broken.message] }
        : { checkedAt: iso(env, 1), ok: true, latencyMs: 118, details: ['Credentials accepted', 'Callback reachable'] },
      error: broken ? { ...broken, occurredAt: iso(env, 6) } : null,
      leadsReceived: provider === 'facebook_lead_ads' ? 41 : provider === 'website' ? 17 : 0,
    })
    const id = `int-${provider}`
    events.push(
      { id: seedId(env, 'intev', `${provider}-1`), tenantId: env.tenantId, integrationId: id, type: 'connected', message: 'Connected', at: iso(env, 24 * 20) },
      { id: seedId(env, 'intev', `${provider}-2`), tenantId: env.tenantId, integrationId: id, type: provider === 'facebook_lead_ads' ? 'lead_received' : 'sync_ok', message: provider === 'facebook_lead_ads' ? 'Lead received from the Diwali offer lead form' : 'Sync completed', at: iso(env, 2) },
    )
    if (broken) events.push({ id: seedId(env, 'intev', `${provider}-3`), tenantId: env.tenantId, integrationId: id, type: 'error', message: broken.message, at: iso(env, 6) })
  }
  return { integrations, integrationEvents: events }
}

function buildForms(env: SeedEnv, adminId: string, sources: LeadSource[], leads: Lead[]): Pick<CaptureSeed, 'leadForms' | 'formSubmissions'> {
  const id = `form-${env.key}-demo`
  const field = (key: string, label: string, type: LeadForm['fields'][number]['type'], required: boolean) => ({
    id: `${id}-${key}`,
    key,
    label,
    placeholder: '',
    required,
    type,
    options: [],
    validation: {},
  })
  const submissions: FormSubmission[] = leads.slice(0, 6).map((lead, index) => ({
    id: seedId(env, 'sub', index + 1),
    tenantId: env.tenantId,
    formId: id,
    leadId: lead.id,
    at: iso(env, 8 + index * 20),
    utm: index % 2 === 0 ? { source: 'google', medium: 'cpc', campaign: 'diwali-dhamaka-search' } : {},
    duplicate: false,
    spam: false,
  }))
  const form: LeadForm = {
    id,
    tenantId: env.tenantId,
    name: 'Website contact form',
    status: 'active',
    fields: [
      field('name', 'Full name', 'text', true),
      field('phone', 'Phone number', 'tel', true),
      field('email', 'Email', 'email', false),
      field('requirement', 'How can we help?', 'textarea', false),
    ],
    submitLabel: 'Request a callback',
    successMessage: 'Thanks! Our team will call you within one business day.',
    redirectUrl: null,
    consentText: 'I agree to be contacted about my enquiry.',
    spamProtection: true,
    defaults: { sourceId: sources.find((source) => source.key === 'landing_page')?.id ?? null, campaignId: null, statusId: null, tags: ['website'], assignMode: 'round_robin', assignUserId: null },
    notifyUserIds: [adminId],
    style: { accent: '#4f46e5', theme: 'light', rounded: true },
    submissionCount: submissions.length,
    createdBy: adminId,
    createdAt: iso(env, 24 * 14),
    updatedAt: iso(env, 24 * 3),
  }
  return { leadForms: [form], formSubmissions: submissions }
}

function buildDeveloper(env: SeedEnv, adminId: string): Pick<CaptureSeed, 'apiKeys' | 'webhooks' | 'webhookDeliveries' | 'vault'> {
  const key: ApiKey = {
    id: seedId(env, 'key', 1),
    tenantId: env.tenantId,
    name: 'CRM data sync',
    prefix: 'lf_live_9fK2',
    last4: 'x7Qa',
    scopes: ['leads:read', 'leads:write', 'deals:read'],
    ipAllowlist: [],
    expiresAt: null,
    createdBy: adminId,
    createdAt: iso(env, 24 * 30),
    lastUsedAt: iso(env, 3),
    usageCount: 1284,
    status: 'active',
    revokedAt: null,
    graceEndsAt: null,
    rotatedFromId: null,
  }
  const endpoint = (n: number, patch: Partial<WebhookEndpoint>): WebhookEndpoint => ({
    id: seedId(env, 'wh', n),
    tenantId: env.tenantId,
    url: 'https://hooks.example.com/leadflow',
    description: 'Warehouse sync',
    events: ['lead.created', 'deal.won'],
    enabled: true,
    secretLast4: n === 1 ? 'a1B2' : 'c3D4',
    headers: [],
    filter: null,
    status: 'active',
    pausedReason: null,
    consecutiveFailures: 0,
    createdBy: adminId,
    createdAt: iso(env, 24 * 10),
    lastDeliveryAt: null,
    lastDeliveryStatus: null,
    ...patch,
  })
  const secrets = { [seedId(env, 'wh', 1)]: 'whsec_seedSecretOne000000000000a1B2', [seedId(env, 'wh', 2)]: 'whsec_seedSecretTwo000000000000c3D4' }
  const delivery = (endpointId: string, n: number, hoursAgo: number, ok: boolean): WebhookDelivery => {
    const at = iso(env, hoursAgo)
    const body = JSON.stringify(samplePayload('lead.created', at))
    return {
      id: seedId(env, 'whd', `${endpointId}-${n}`),
      tenantId: env.tenantId,
      endpointId,
      eventId: seedId(env, 'evt', `${endpointId}-${n}`),
      event: 'lead.created',
      at,
      status: ok ? 'success' : 'failed',
      httpStatus: ok ? 200 : 500,
      durationMs: ok ? 140 : 95,
      attempt: 1,
      nextRetryAt: null,
      requestBody: body,
      requestHeaders: {
        'Content-Type': 'application/json',
        'X-LeadFlow-Event': 'lead.created',
        'X-LeadFlow-Signature': signPayload(secrets[endpointId], body, Math.floor(new Date(at).getTime() / 1000)),
      },
      responseBody: ok ? '{"received":true}' : '{"error":"Internal Server Error"}',
      test: false,
    }
  }
  const first = seedId(env, 'wh', 1)
  const second = seedId(env, 'wh', 2)
  return {
    apiKeys: [key],
    webhooks: [
      endpoint(1, { lastDeliveryAt: iso(env, 2), lastDeliveryStatus: 'success' }),
      endpoint(2, {
        url: 'https://crm-sync.example.org/events',
        description: 'Analytics (broken)',
        status: 'paused',
        enabled: true,
        consecutiveFailures: 5,
        pausedReason: 'Paused automatically after 5 failed deliveries in a row.',
        lastDeliveryAt: iso(env, 5),
        lastDeliveryStatus: 'failed',
      }),
    ],
    webhookDeliveries: [
      ...[2, 14, 30, 52].map((hours, i) => delivery(first, i + 1, hours, true)),
      ...[5, 6, 7, 8, 9].map((hours, i) => delivery(second, i + 1, hours, false)),
    ],
    vault: secrets,
  }
}

export function buildCaptureData(env: SeedEnv, users: User[], sources: LeadSource[], leads: Lead[], campaigns: Campaign[]): CaptureSeed {
  void campaigns
  const admin = users.find((user) => user.role === 'admin') ?? users[0]
  return {
    ...buildIntegrations(env, admin.id, sources),
    ...buildForms(env, admin.id, sources, leads),
    ...buildDeveloper(env, admin.id),
  }
}
