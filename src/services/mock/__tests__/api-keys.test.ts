import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import { advance } from './inbox-fixtures'

beforeEach(() => {
  setupMock()
  actAs(USERS.priya)
})
afterEach(teardownMock)

const HOUR = 3_600_000

describe('API key creation', () => {
  it('reveals the full key once and only the prefix and last 4 afterwards', async () => {
    const { key, secret } = await api.apiKeys.create({ name: 'Zapier', scopes: ['leads:read', 'leads:write'] })
    expect(secret).toMatch(/^lf_live_[A-Za-z0-9]{32}$/)
    expect(key).toMatchObject({ prefix: secret.slice(0, 12), last4: secret.slice(-4), status: 'active', usageCount: 0, tenantId: ACME_TENANT_ID })

    const listed = await api.apiKeys.list()
    expect(JSON.stringify(listed)).not.toContain(secret)
    expect(JSON.stringify(tables().apiKeys)).not.toContain(secret)
    expect(JSON.stringify(tables().auditLogs)).not.toContain(secret)
    expect(JSON.stringify(await api.apiKeys.summary())).not.toContain(secret)
  })

  it('audits creation without the value', async () => {
    const { key } = await api.apiKeys.create({ name: 'Audited', scopes: ['deals:read'] })
    const log = tables().auditLogs.find((entry) => entry.entity === 'api_key' && entry.entityId === key.id)
    expect(log).toMatchObject({ action: 'created', newValue: { event: 'created', scopes: ['deals:read'] } })
  })

  it('validates scopes, name, IP allowlist and expiry', async () => {
    const bad = (input: object) => api.apiKeys.create(input as Parameters<typeof api.apiKeys.create>[0])
    await expect(bad({ name: 'x', scopes: ['leads:read'] })).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(bad({ name: 'Valid', scopes: [] })).rejects.toMatchObject({ fieldErrors: { scopes: expect.any(Array) } })
    await expect(bad({ name: 'Valid', scopes: ['leads:delete'] })).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(bad({ name: 'Valid', scopes: ['leads:read'], ipAllowlist: ['not-an-ip'] })).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(bad({ name: 'Valid', scopes: ['leads:read'], expiresAt: '2020-01-01T00:00:00.000Z' })).rejects.toMatchObject({ fieldErrors: { expiresAt: ['Choose a date in the future.'] } })
    await expect(bad({ name: 'Valid', scopes: ['leads:read', 'leads:read'], ipAllowlist: ['10.0.0.1', '10.1.0.0/16'] })).resolves.toMatchObject({ key: { scopes: ['leads:read'], ipAllowlist: ['10.0.0.1', '10.1.0.0/16'] } })
  })

  it('is restricted to roles with the API keys section', async () => {
    actAs(USERS.neha)
    await expect(api.apiKeys.create({ name: 'Nope', scopes: ['leads:read'] })).rejects.toMatchObject({ code: 'FORBIDDEN' })
    actAs(USERS.ananya)
    await expect(api.apiKeys.list()).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})

describe('revoke and rotate', () => {
  it('revokes once and audits it', async () => {
    const { key } = await api.apiKeys.create({ name: 'Short lived', scopes: ['leads:read'] })
    const revoked = await api.apiKeys.revoke(key.id)
    expect(revoked).toMatchObject({ status: 'revoked' })
    expect(revoked.revokedAt).not.toBeNull()
    await expect(api.apiKeys.revoke(key.id)).rejects.toMatchObject({ code: 'CONFLICT' })
    expect(tables().auditLogs.some((log) => log.entityId === key.id && log.newValue?.event === 'revoked')).toBe(true)
  })

  it('rotates with a grace period: the new key is active, the old one works until the grace ends', async () => {
    const { key: old } = await api.apiKeys.create({ name: 'Rotating', scopes: ['leads:read'] })
    const { key: next, secret } = await api.apiKeys.rotate(old.id, 24)
    expect(next).toMatchObject({ name: 'Rotating', scopes: ['leads:read'], rotatedFromId: old.id, status: 'active' })
    expect(secret).toMatch(/^lf_live_/)
    expect(secret.slice(-4)).toBe(next.last4)

    let keys = await api.apiKeys.list()
    expect(keys.find((k) => k.id === old.id)).toMatchObject({ status: 'active' })
    expect(keys.find((k) => k.id === old.id)?.graceEndsAt).not.toBeNull()

    advance(25 * HOUR)
    keys = await api.apiKeys.list()
    expect(keys.find((k) => k.id === old.id)).toMatchObject({ status: 'revoked' })
    expect(keys.find((k) => k.id === next.id)).toMatchObject({ status: 'active' })
  })

  it('rotating with no grace revokes the old key at once; an old key cannot be rotated twice', async () => {
    const { key: old } = await api.apiKeys.create({ name: 'Immediate', scopes: ['leads:read'] })
    await api.apiKeys.rotate(old.id, 0)
    expect((await api.apiKeys.list()).find((k) => k.id === old.id)).toMatchObject({ status: 'revoked' })
    await expect(api.apiKeys.rotate(old.id, 0)).rejects.toMatchObject({ code: 'CONFLICT' })
    const { key } = await api.apiKeys.create({ name: 'Grace check', scopes: ['leads:read'] })
    await expect(api.apiKeys.rotate(key.id, 999)).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('summarizes keys in use', async () => {
    const before = await api.apiKeys.summary()
    const { key } = await api.apiKeys.create({ name: 'Counted', scopes: ['leads:read'] })
    await api.apiKeys.revoke(key.id)
    const after = await api.apiKeys.summary()
    expect(after.revoked).toBe(before.revoked + 1)
    expect(after.active).toBe(before.active)
  })
})
