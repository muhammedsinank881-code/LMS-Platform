import { describe, expect, it } from 'vitest'
import type { WebhookEndpoint } from '@/types'
import { matchEndpoints, retryDelayMs, shouldAutoPause, toWebhookEvent } from './dispatch'
import { maskSecret, redact, redactHeaders } from './redact'
import { hmacSha256Hex, sha256, toHex } from './sha256'
import { signPayload, verifySignature } from './signature'

async function webCryptoHmac(key: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return toHex(new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))))
}

describe('sha256 / hmac', () => {
  it('matches known vectors', () => {
    expect(toHex(sha256(new TextEncoder().encode('abc')))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    expect(toHex(sha256(new Uint8Array(0)))).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })

  it('matches Web Crypto HMAC for short, long and multi-block inputs', async () => {
    for (const [key, message] of [
      ['whsec_secret', '1700000000.{"a":1}'],
      ['k'.repeat(100), 'x'.repeat(200)],
      ['k', ''],
    ]) {
      expect(hmacSha256Hex(key, message)).toBe(await webCryptoHmac(key, message))
    }
  })
})

describe('signature', () => {
  it('signs timestamp.body and verifies within tolerance', () => {
    const header = signPayload('s3cret', '{"id":1}', 1_700_000_000)
    expect(header).toMatch(/^t=1700000000,v1=[0-9a-f]{64}$/)
    expect(verifySignature('s3cret', '{"id":1}', header, 1_700_000_100)).toBe(true)
  })

  it('rejects a wrong secret, a changed body and a replay', () => {
    const header = signPayload('s3cret', '{"id":1}', 1_700_000_000)
    expect(verifySignature('other', '{"id":1}', header, 1_700_000_001)).toBe(false)
    expect(verifySignature('s3cret', '{"id":2}', header, 1_700_000_001)).toBe(false)
    expect(verifySignature('s3cret', '{"id":1}', header, 1_700_001_000)).toBe(false)
  })
})

const endpoint = (patch: Partial<WebhookEndpoint>): WebhookEndpoint => ({
  id: 'e1',
  tenantId: 't1',
  url: 'https://x.test',
  description: '',
  events: ['lead.created'],
  enabled: true,
  secretLast4: 'abcd',
  headers: [],
  filter: null,
  status: 'active',
  pausedReason: null,
  consecutiveFailures: 0,
  createdBy: 'u',
  createdAt: '',
  lastDeliveryAt: null,
  lastDeliveryStatus: null,
  ...patch,
})

describe('matchEndpoints', () => {
  const ctx = { tenantId: 't1', sourceId: 's-fb' }
  it('requires the same tenant, enabled, not paused and a subscription', () => {
    const list = [
      endpoint({ id: 'ok' }),
      endpoint({ id: 'other-tenant', tenantId: 't2' }),
      endpoint({ id: 'off', enabled: false }),
      endpoint({ id: 'paused', status: 'paused' }),
      endpoint({ id: 'not-subscribed', events: ['deal.won'] }),
      endpoint({ id: 'failing', status: 'failing' }),
    ]
    expect(matchEndpoints('lead.created', ctx, list).map((e) => e.id)).toEqual(['ok', 'failing'])
  })

  it('applies the source filter', () => {
    const list = [
      endpoint({ id: 'fb-only', filter: { sourceIds: ['s-fb'] } }),
      endpoint({ id: 'google-only', filter: { sourceIds: ['s-g'] } }),
      endpoint({ id: 'all', filter: { sourceIds: [] } }),
    ]
    expect(matchEndpoints('lead.created', ctx, list).map((e) => e.id)).toEqual(['fb-only', 'all'])
    expect(matchEndpoints('lead.created', { tenantId: 't1', sourceId: null }, list).map((e) => e.id)).toEqual(['all'])
  })
})

describe('events, retries and pausing', () => {
  it('maps bus events to public events', () => {
    expect(toWebhookEvent('status_changed')).toBe('lead.status_changed')
    expect(toWebhookEvent('lead_converted')).toBe('lead.converted')
    expect(toWebhookEvent('message_received')).toBe('conversation.message_received')
    expect(toWebhookEvent('score_crossed')).toBeNull()
  })

  it('retries at 1, 5 and 30 minutes, then stops', () => {
    expect([1, 2, 3, 4].map(retryDelayMs)).toEqual([60_000, 300_000, 1_800_000, null])
  })

  it('pauses after five failures in a row', () => {
    expect([4, 5, 6].map(shouldAutoPause)).toEqual([false, true, true])
  })
})

describe('redaction', () => {
  it('masks to the last four characters', () => {
    expect(maskSecret('whsec_abcdefgh1234')).toBe('••••1234')
  })

  it('redacts secret-looking keys and our own key shapes, deeply', () => {
    const out = redact({ user: 'a', apiKey: 'lf_live_AAAAAAAAAAAAAAAA', nested: { token: 'x', note: 'key lf_live_BBBBBBBBBBBBBBBB here', list: [{ password: 'p' }] } })
    expect(JSON.stringify(out)).not.toMatch(/lf_live_|"x"|"p"/)
    expect(out.user).toBe('a')
  })

  it('redacts authorization headers but keeps the signature', () => {
    expect(redactHeaders({ Authorization: 'Bearer abc', 'X-LeadFlow-Signature': 't=1,v1=ff', 'X-Api-Key': 'k' })).toEqual({
      Authorization: '[redacted]',
      'X-LeadFlow-Signature': 't=1,v1=ff',
      'X-Api-Key': '[redacted]',
    })
  })
})
