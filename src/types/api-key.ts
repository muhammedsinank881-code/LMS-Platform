import type { TenantOwned } from './common'
import type { UserId } from './ids'

export const API_SCOPES = [
  'leads:read',
  'leads:write',
  'deals:read',
  'deals:write',
  'followups:read',
  'followups:write',
  'webhooks:manage',
] as const
export type ApiScope = (typeof API_SCOPES)[number]

export interface ApiKey extends TenantOwned {
  id: string
  name: string
  /** First characters of the key, safe to display. */
  prefix: string
  last4: string
  scopes: ApiScope[]
  ipAllowlist: string[]
  expiresAt: string | null
  createdBy: UserId
  createdAt: string
  lastUsedAt: string | null
  usageCount: number
  status: 'active' | 'revoked'
  revokedAt: string | null
  /** For a key replaced by rotation: when it stops working. */
  graceEndsAt: string | null
  rotatedFromId: string | null
}

export interface CreateApiKeyInput {
  name: string
  scopes: ApiScope[]
  ipAllowlist?: string[]
  expiresAt?: string | null
}

/** Returned once. `secret` is the only time the full key leaves the server. */
export interface ApiKeyCreated {
  key: ApiKey
  secret: string
}

export interface ApiKeyUsageSummary {
  active: number
  revoked: number
  expiringSoon: number
  requests30d: number
}
