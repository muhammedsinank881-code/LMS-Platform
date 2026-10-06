/**
 * Synchronous SHA-256 and HMAC-SHA-256. The mock backend signs inside a synchronous request
 * handler, where `crypto.subtle` (async only) cannot be awaited. A test checks this against Web
 * Crypto, and a real backend would use its platform HMAC.
 */
const PRIMES: number[] = []
for (let candidate = 2; PRIMES.length < 64; candidate += 1) {
  if (PRIMES.every((prime) => candidate % prime !== 0)) PRIMES.push(candidate)
}
const fraction = (value: number) => Math.floor((value % 1) * 2 ** 32) >>> 0
const K = PRIMES.map((prime) => fraction(Math.cbrt(prime)))
const H0 = PRIMES.slice(0, 8).map((prime) => fraction(Math.sqrt(prime)))

const rotr = (value: number, bits: number) => (value >>> bits) | (value << (32 - bits))

export function sha256(data: Uint8Array): Uint8Array {
  const bitLength = data.length * 8
  const padded = new Uint8Array(((data.length + 9 + 63) >> 6) << 6)
  padded.set(data)
  padded[data.length] = 0x80
  const view = new DataView(padded.buffer)
  view.setUint32(padded.length - 8, Math.floor(bitLength / 2 ** 32))
  view.setUint32(padded.length - 4, bitLength >>> 0)

  const hash = Uint32Array.from(H0)
  const w = new Uint32Array(64)
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4)
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)
      w[i] = w[i - 16] + s0 + w[i - 7] + s1
    }
    let [a, b, c, d, e, f, g, h] = hash
    for (let i = 0; i < 64; i += 1) {
      const t1 = h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]
      const t2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))
      h = g
      g = f
      f = e
      e = (d + t1) | 0
      d = c
      c = b
      b = a
      a = (t1 + t2) | 0
    }
    ;[a, b, c, d, e, f, g, h].forEach((value, i) => {
      hash[i] += value
    })
  }

  const out = new Uint8Array(32)
  const outView = new DataView(out.buffer)
  hash.forEach((value, i) => outView.setUint32(i * 4, value))
  return out
}

const encode = (text: string) => new TextEncoder().encode(text)

export const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

export function hmacSha256(key: string, message: string): Uint8Array {
  let keyBytes: Uint8Array = encode(key)
  if (keyBytes.length > 64) keyBytes = sha256(keyBytes)
  const inner = new Uint8Array(64).fill(0x36)
  const outer = new Uint8Array(64).fill(0x5c)
  keyBytes.forEach((byte, i) => {
    inner[i] ^= byte
    outer[i] ^= byte
  })
  const body = encode(message)
  const innerHash = sha256(Uint8Array.from([...inner, ...body]))
  return sha256(Uint8Array.from([...outer, ...innerHash]))
}

export const hmacSha256Hex = (key: string, message: string) => toHex(hmacSha256(key, message))
