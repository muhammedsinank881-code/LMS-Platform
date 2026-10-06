import type { TenantOwned } from './common'
import type { UserId } from './ids'

export const INTEGRATION_PROVIDERS = [
  'whatsapp',
  'email',
  'facebook_lead_ads',
  'instagram',
  'google_ads',
  'linkedin',
  'telephony',
  'website',
] as const
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number]

export const INTEGRATION_STATUSES = ['not_connected', 'connecting', 'connected', 'error', 'expired'] as const
export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number]

/** A secret as the UI may see it after creation: only a masked tail, never the value. */
export interface SecretRef {
  masked: string
}

export const ASSIGN_MODES = ['specific_user', 'rules', 'round_robin'] as const
export type AssignMode = (typeof ASSIGN_MODES)[number]

/** What a lead arriving through an integration or form gets when the payload does not say. */
export interface LeadDefaults {
  sourceId: string | null
  campaignId: string | null
  statusId: string | null
  tags: string[]
  assignMode: AssignMode
  assignUserId: string | null
}

/** `leadField` is a standard lead field key, or `custom.<key>` for a custom field. */
export interface FieldMapping {
  sourceField: string
  leadField: string
}

/** One external lead form (Facebook, Google, LinkedIn) and how its answers map to lead fields. */
export interface LeadFormMapping {
  formId: string
  formName: string
  /** The questions the form asks, so the mapping editor can list them. */
  questions: string[]
  fields: FieldMapping[]
  defaults: LeadDefaults
}

export interface LeadAdsConfig {
  pageId: string | null
  pageName: string | null
  accountIds: string[]
  forms: LeadFormMapping[]
  syncCampaigns: boolean
  syncSpend: boolean
  lastLeadAt: string | null
}

export const LEAD_ADS_PROVIDERS = ['facebook_lead_ads', 'instagram', 'google_ads', 'linkedin'] as const
export type LeadAdsProvider = (typeof LEAD_ADS_PROVIDERS)[number]

export const EMAIL_PROVIDERS = ['google', 'microsoft', 'smtp'] as const
export type EmailProvider = (typeof EMAIL_PROVIDERS)[number]

export type IntegrationConfig =
  | {
      provider: 'whatsapp'
      businessAccountId: string
      phoneNumberId: string
      displayName: string
      quality: 'green' | 'yellow' | 'red'
      token: SecretRef
      verifyToken: string
      callbackUrl: string
      webhookVerified: boolean
      templatesSyncedAt: string | null
    }
  | {
      provider: 'email'
      mailProvider: EmailProvider
      fromName: string
      fromEmail: string
      signature: string
      trackOpens: boolean
      trackClicks: boolean
      password: SecretRef | null
      testSentAt: string | null
    }
  | ({ provider: LeadAdsProvider } & LeadAdsConfig)
  | {
      provider: 'telephony'
      vendor: string
      clickToCall: boolean
      syncCallLogs: boolean
      extensions: Array<{ userId: UserId; extension: string }>
    }
  | { provider: 'website'; domain: string; snippetInstalled: boolean }

export interface IntegrationHealth {
  checkedAt: string | null
  ok: boolean
  latencyMs: number | null
  details: string[]
}

export interface IntegrationError {
  kind: 'error' | 'expired'
  message: string
  suggestedFix: string
  occurredAt: string
}

export interface Integration extends TenantOwned {
  /** `int-<provider>`: each workspace has at most one row per provider. */
  id: string
  provider: IntegrationProvider
  status: IntegrationStatus
  connectedBy: UserId | null
  connectedAt: string | null
  accountLabel: string | null
  lastSyncAt: string | null
  config: IntegrationConfig | null
  health: IntegrationHealth
  error: IntegrationError | null
  leadsReceived: number
}

export const INTEGRATION_EVENT_TYPES = [
  'connected',
  'disconnected',
  'reconnected',
  'config_changed',
  'lead_received',
  'message_sent',
  'sync_ok',
  'error',
] as const
export type IntegrationEventType = (typeof INTEGRATION_EVENT_TYPES)[number]

export interface IntegrationEvent extends TenantOwned {
  id: string
  integrationId: string
  type: IntegrationEventType
  message: string
  at: string
}

/** Connect and config changes. Secrets travel once, in `secret`, and are masked on the way in. */
export interface ConnectIntegrationInput {
  provider: IntegrationProvider
  accountLabel: string
  config: IntegrationConfig
  secret?: string
}

export interface UpdateIntegrationInput {
  accountLabel?: string
  config: IntegrationConfig
  secret?: string
}

export interface SendTestLeadResult {
  leadId: string
  duplicate: boolean
}

export const INTEGRATION_PROVIDER_LABEL: Record<IntegrationProvider, string> = {
  whatsapp: 'WhatsApp Business',
  email: 'Email',
  facebook_lead_ads: 'Facebook Lead Ads',
  instagram: 'Instagram Lead Ads',
  google_ads: 'Google Ads',
  linkedin: 'LinkedIn Lead Gen',
  telephony: 'Telephony',
  website: 'Website',
}
