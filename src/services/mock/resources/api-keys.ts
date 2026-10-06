import type { ApiKeysApiClient } from '@/services/api/api-keys'
import { ApiError } from '@/services/api/errors'
import { createApiKeySchema, type ApiKey, type ApiKeyCreated, type CreateApiKeyInput } from '@/types'
import { request, type RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { requireSection } from '../core/section'
import { randomToken } from '../core/secrets'
import { newId } from '../core/util'
import { parseInput, validationError } from '../core/validate'

const MAX_GRACE_HOURS = 168
const DAY_MS = 86_400_000

const guard = (ctx: RequestContext) => requireSection(ctx, 'api_keys')

/** Keys whose rotation grace period has ended stop working. Applied lazily, like an expiry job. */
function settleGrace(ctx: RequestContext): void {
  for (const key of ctx.db.all('apiKeys')) {
    if (key.status === 'active' && key.graceEndsAt && key.graceEndsAt <= ctx.timestamp) {
      ctx.db.save('apiKeys', { ...key, status: 'revoked', revokedAt: key.graceEndsAt })
    }
  }
}

function audit(ctx: RequestContext, key: ApiKey, action: 'created' | 'updated', note: string): void {
  // Never the key itself: only that something happened to it.
  recordAudit(ctx, { action, entity: 'api_key', entityId: key.id, entityLabel: key.name, newValue: { event: note, scopes: key.scopes } })
}

function issue(ctx: RequestContext, input: CreateApiKeyInput, extra: Partial<ApiKey> = {}): ApiKeyCreated {
  const secret = `lf_live_${randomToken(32)}`
  const key = ctx.db.insert('apiKeys', {
    id: newId('key'),
    name: input.name.trim(),
    prefix: secret.slice(0, 12),
    last4: secret.slice(-4),
    scopes: [...new Set(input.scopes)],
    ipAllowlist: input.ipAllowlist ?? [],
    expiresAt: input.expiresAt || null,
    createdBy: ctx.actor.id,
    createdAt: ctx.timestamp,
    lastUsedAt: null,
    usageCount: 0,
    status: 'active',
    revokedAt: null,
    graceEndsAt: null,
    rotatedFromId: null,
    ...extra,
  })
  return { key, secret }
}

export const mockApiKeysApi: ApiKeysApiClient = {
  list: () =>
    request((ctx) => {
      guard(ctx)
      settleGrace(ctx)
      return [...ctx.db.all('apiKeys')].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
    }),
  summary: () =>
    request((ctx) => {
      guard(ctx)
      settleGrace(ctx)
      const keys = ctx.db.all('apiKeys')
      const soon = new Date(ctx.now.getTime() + 14 * DAY_MS).toISOString()
      return {
        active: keys.filter((key) => key.status === 'active').length,
        revoked: keys.filter((key) => key.status === 'revoked').length,
        expiringSoon: keys.filter((key) => key.status === 'active' && key.expiresAt && key.expiresAt <= soon).length,
        requests30d: keys.reduce((total, key) => total + key.usageCount, 0),
      }
    }),
  create: (input) =>
    request((ctx) => {
      guard(ctx)
      const parsed = parseInput(createApiKeySchema, input)
      if (parsed.expiresAt && parsed.expiresAt <= ctx.timestamp) throw validationError('expiresAt', 'Choose a date in the future.')
      const created = issue(ctx, parsed)
      audit(ctx, created.key, 'created', 'created')
      return created
    }),
  revoke: (id) =>
    request((ctx) => {
      guard(ctx)
      const key = ctx.db.get('apiKeys', id, 'API key')
      if (key.status === 'revoked') throw new ApiError('CONFLICT', 'This key is already revoked.')
      const saved = ctx.db.save('apiKeys', { ...key, status: 'revoked', revokedAt: ctx.timestamp, graceEndsAt: null })
      audit(ctx, saved, 'updated', 'revoked')
      return saved
    }),
  rotate: (id, graceHours) =>
    request((ctx) => {
      guard(ctx)
      settleGrace(ctx)
      const old = ctx.db.get('apiKeys', id, 'API key')
      if (old.status !== 'active') throw new ApiError('CONFLICT', 'Only an active key can be rotated.')
      if (!Number.isFinite(graceHours) || graceHours < 0 || graceHours > MAX_GRACE_HOURS) {
        throw validationError('graceHours', 'Choose a grace period between 0 and 7 days.')
      }
      const created = issue(ctx, old, { rotatedFromId: old.id })
      if (graceHours === 0) {
        ctx.db.save('apiKeys', { ...old, status: 'revoked', revokedAt: ctx.timestamp })
      } else {
        ctx.db.save('apiKeys', { ...old, graceEndsAt: new Date(ctx.now.getTime() + graceHours * 3_600_000).toISOString() })
      }
      audit(ctx, created.key, 'updated', graceHours === 0 ? 'rotated' : `rotated, old key valid for ${graceHours}h`)
      return created
    }),
}
