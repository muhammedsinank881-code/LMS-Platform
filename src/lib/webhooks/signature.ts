import { hmacSha256Hex } from './sha256'

export const SIGNATURE_HEADER = 'X-LeadFlow-Signature'
export const EVENT_HEADER = 'X-LeadFlow-Event'
/** Deliveries older than this are rejected, which blocks replays. */
export const SIGNATURE_TOLERANCE_SECONDS = 300

/** The signed string is `<unix seconds>.<raw body>`, as in the docs example. */
export function signPayload(secret: string, body: string, timestampSeconds: number): string {
  const signature = hmacSha256Hex(secret, `${timestampSeconds}.${body}`)
  return `t=${timestampSeconds},v1=${signature}`
}

export function verifySignature(
  secret: string,
  body: string,
  header: string,
  nowSeconds: number,
  toleranceSeconds = SIGNATURE_TOLERANCE_SECONDS,
): boolean {
  const parts = Object.fromEntries(header.split(',').map((part) => part.split('=') as [string, string]))
  const timestamp = Number(parts.t)
  if (!Number.isFinite(timestamp) || !parts.v1) return false
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) return false
  const expected = hmacSha256Hex(secret, `${timestamp}.${body}`)
  if (expected.length !== parts.v1.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ parts.v1.charCodeAt(i)
  return diff === 0
}
