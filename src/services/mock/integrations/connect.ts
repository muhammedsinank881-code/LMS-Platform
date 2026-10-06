import { maskSecret } from '@/lib/webhooks/redact'
import { ApiError } from '@/services/api/errors'
import {
  LEAD_ADS_PROVIDERS,
  type ConnectIntegrationInput,
  type Integration,
  type IntegrationConfig,
  type IntegrationProvider,
  type UpdateIntegrationInput,
} from '@/types'
import type { RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { validationError } from '../core/validate'
import { emptyIntegration, ensureIntegrations, integrationId, logEvent } from './support'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CONTACT_FIELDS = ['phone', 'whatsapp', 'email']

/** Provider-specific checks. Secrets are validated here and never stored. */
function validateConfig(provider: IntegrationProvider, config: IntegrationConfig, secret: string | undefined, requireSecret: boolean): void {
  if (config.provider !== provider) throw validationError('provider', 'That configuration belongs to another provider.')
  switch (config.provider) {
    case 'whatsapp':
      if (!config.businessAccountId.trim()) throw validationError('businessAccountId', 'Enter the business account ID.')
      if (!config.phoneNumberId.trim()) throw validationError('phoneNumberId', 'Enter the phone number ID.')
      if (!config.verifyToken.trim()) throw validationError('verifyToken', 'A verify token is needed.')
      if (requireSecret && !secret?.trim()) throw validationError('token', 'Enter the access token.')
      return
    case 'email':
      if (!EMAIL.test(config.fromEmail)) throw validationError('fromEmail', 'Enter a valid sending address.')
      if (!config.fromName.trim()) throw validationError('fromName', 'Enter a sender name.')
      if (config.mailProvider === 'smtp' && requireSecret && !secret?.trim()) throw validationError('password', 'Enter the SMTP password.')
      return
    case 'telephony':
      if (!config.vendor.trim()) throw validationError('vendor', 'Choose a telephony provider.')
      return
    case 'website':
      if (!config.domain.trim()) throw validationError('domain', 'Enter your website domain.')
      return
    default:
      if (config.provider === 'google_ads') {
        if (config.accountIds.length === 0) throw validationError('accountIds', 'Choose at least one ad account.')
      } else if (config.forms.length === 0) {
        throw validationError('forms', 'Choose at least one lead form.')
      }
      for (const form of config.forms) {
        if (!form.fields.some((field) => CONTACT_FIELDS.includes(field.leadField))) {
          throw validationError('forms', `Map a phone, WhatsApp or email field for "${form.formName}".`)
        }
      }
  }
}

/** Replaces any secret in the config with a masked reference. The raw value is dropped here. */
export function maskConfig(config: IntegrationConfig, secret: string | undefined, previous: IntegrationConfig | null): IntegrationConfig {
  if (config.provider === 'whatsapp') {
    const kept = previous?.provider === 'whatsapp' ? previous.token : { masked: '' }
    return { ...config, token: secret ? { masked: maskSecret(secret) } : kept }
  }
  if (config.provider === 'email') {
    const kept = previous?.provider === 'email' ? previous.password : null
    return { ...config, password: secret ? { masked: maskSecret(secret) } : kept }
  }
  return config
}

const healthy = (ctx: RequestContext, details: string[]) => ({ checkedAt: ctx.timestamp, ok: true, latencyMs: 120, details })

function audit(ctx: RequestContext, row: Integration, action: 'created' | 'settings_changed' | 'deleted', note: string) {
  recordAudit(ctx, {
    action,
    entity: 'integration',
    entityId: row.id,
    entityLabel: row.provider,
    newValue: { provider: row.provider, status: row.status, note },
  })
}

export function getIntegration(ctx: RequestContext, provider: IntegrationProvider): Integration {
  ensureIntegrations(ctx)
  return ctx.db.get('integrations', integrationId(provider))
}

export function beginConnect(ctx: RequestContext, provider: IntegrationProvider): Integration {
  const row = getIntegration(ctx, provider)
  if (row.status === 'connected') throw new ApiError('CONFLICT', 'This integration is already connected.')
  return ctx.db.save('integrations', { ...row, status: 'connecting', error: null })
}

export function connect(ctx: RequestContext, input: ConnectIntegrationInput): Integration {
  const row = getIntegration(ctx, input.provider)
  if (row.status === 'connected') throw new ApiError('CONFLICT', 'This integration is already connected.')
  validateConfig(input.provider, input.config, input.secret, true)
  const saved = ctx.db.save('integrations', {
    ...row,
    status: 'connected',
    connectedBy: ctx.actor.id,
    connectedAt: ctx.timestamp,
    accountLabel: input.accountLabel.trim() || null,
    config: maskConfig(input.config, input.secret, null),
    health: healthy(ctx, ['Credentials accepted', 'Callback reachable']),
    error: null,
  })
  logEvent(ctx, saved, 'connected', `Connected ${saved.accountLabel ?? saved.provider}`)
  audit(ctx, saved, 'created', 'connected')
  return saved
}

export function updateConfig(ctx: RequestContext, provider: IntegrationProvider, input: UpdateIntegrationInput): Integration {
  const row = getIntegration(ctx, provider)
  if (row.status === 'not_connected' || row.status === 'connecting') throw new ApiError('CONFLICT', 'Connect this integration first.')
  validateConfig(provider, input.config, input.secret, false)
  const saved = ctx.db.save('integrations', {
    ...row,
    accountLabel: input.accountLabel?.trim() || row.accountLabel,
    config: maskConfig(input.config, input.secret, row.config),
  })
  logEvent(ctx, saved, 'config_changed', input.secret ? 'Settings and credentials updated' : 'Settings updated')
  audit(ctx, saved, 'settings_changed', input.secret ? 'settings and credentials changed' : 'settings changed')
  return saved
}

export function reconnect(ctx: RequestContext, provider: IntegrationProvider): Integration {
  const row = getIntegration(ctx, provider)
  if (row.status !== 'error' && row.status !== 'expired') throw new ApiError('CONFLICT', 'Only a broken or expired connection can be reconnected.')
  const saved = ctx.db.save('integrations', {
    ...row,
    status: 'connected',
    error: null,
    health: healthy(ctx, ['Credentials renewed', 'Callback reachable']),
  })
  logEvent(ctx, saved, 'reconnected', 'Connection restored')
  audit(ctx, saved, 'settings_changed', 'reconnected')
  return saved
}

export function disconnect(ctx: RequestContext, provider: IntegrationProvider): Integration {
  const row = getIntegration(ctx, provider)
  if (row.status === 'not_connected') return row
  const wasConnecting = row.status === 'connecting'
  const saved = ctx.db.save('integrations', { ...emptyIntegration(provider), tenantId: row.tenantId })
  logEvent(ctx, saved, 'disconnected', wasConnecting ? 'Connection cancelled' : 'Disconnected')
  if (!wasConnecting) audit(ctx, saved, 'deleted', 'disconnected')
  return saved
}

export const isLeadAds = (provider: IntegrationProvider): provider is (typeof LEAD_ADS_PROVIDERS)[number] =>
  (LEAD_ADS_PROVIDERS as readonly string[]).includes(provider)
