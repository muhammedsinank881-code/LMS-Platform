import type { ApiKey } from '@/types'
import type { EndpointDoc } from './endpoints'

export const BASE_URL = 'https://api.your-workspace.leadflow.example'

/** The key as it may be shown in a snippet: prefix, bullets, last four. Never the secret. */
export const maskedKey = (key: Pick<ApiKey, 'prefix' | 'last4'>) => `${key.prefix}••••••••••••••••${key.last4}`

export function curlFor(endpoint: EndpointDoc, key: string): string {
  const path = endpoint.path.replace(':id', 'L-10231')
  const lines = [`curl -X ${endpoint.method} "${BASE_URL}${path}"`, `  -H "Authorization: Bearer ${key}"`]
  if (endpoint.requestExample) {
    lines.push('  -H "Content-Type: application/json"', `  -d '${JSON.stringify(endpoint.requestExample)}'`)
  }
  return lines.join(' \\\n')
}

/** A starter request for a key: a read if it can read leads, otherwise whatever its first scope allows. */
export function curlForKey(key: Pick<ApiKey, 'prefix' | 'last4' | 'scopes'>): string {
  const target = key.scopes.includes('leads:read')
    ? { method: 'GET', path: '/api/leads?pageSize=5' }
    : key.scopes.includes('deals:read')
      ? { method: 'GET', path: '/api/deals' }
      : key.scopes.includes('followups:read')
        ? { method: 'GET', path: '/api/follow-ups' }
        : key.scopes.includes('webhooks:manage')
          ? { method: 'GET', path: '/api/webhooks' }
          : { method: 'POST', path: '/api/leads' }
  return [`curl -X ${target.method} "${BASE_URL}${target.path}"`, `  -H "Authorization: Bearer ${maskedKey(key)}"`].join(' \\\n')
}

export const VERIFY_JS = `import crypto from 'node:crypto'

// \`rawBody\` must be the exact bytes received, before any JSON parsing.
export function verifyLeadFlowSignature(rawBody, header, secret, toleranceSeconds = 300) {
  const parts = Object.fromEntries(header.split(',').map((part) => part.split('=')))
  const timestamp = Number(parts.t)
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false

  const expected = crypto.createHmac('sha256', secret).update(\`\${timestamp}.\${rawBody}\`).digest('hex')
  const given = Buffer.from(parts.v1 ?? '', 'hex')
  const wanted = Buffer.from(expected, 'hex')
  return given.length === wanted.length && crypto.timingSafeEqual(given, wanted)
}`

export const VERIFY_PY = `import hashlib, hmac, time

def verify_leadflow_signature(raw_body: bytes, header: str, secret: str, tolerance: int = 300) -> bool:
    parts = dict(item.split("=", 1) for item in header.split(","))
    timestamp = int(parts.get("t", "0"))
    if not timestamp or abs(time.time() - timestamp) > tolerance:
        return False

    signed = f"{timestamp}.".encode() + raw_body
    expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, parts.get("v1", ""))`
