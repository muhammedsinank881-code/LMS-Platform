const REDACTED = '[redacted]'
const SECRET_KEY = /secret|token|password|authorization|api[-_]?key|cookie/i
/** Shapes of values we mint ourselves: lf_live_..., whsec_... */
const SECRET_VALUE = /\b(?:lf_(?:live|test)_|whsec_)[A-Za-z0-9]{8,}\b/g

/** Last four characters behind bullets: the only form of a secret the UI ever shows. */
export function maskSecret(secret: string): string {
  return `••••${secret.slice(-4)}`
}

export function redactText(text: string): string {
  return text.replace(SECRET_VALUE, REDACTED)
}

/** Deep copy with secret-looking keys and values replaced. Safe for logs, drawers and audit values. */
export function redact<T>(value: T): T {
  if (typeof value === 'string') return redactText(value) as T
  if (Array.isArray(value)) return value.map((item) => redact(item)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, SECRET_KEY.test(key) ? REDACTED : redact(inner)]),
    ) as T
  }
  return value
}

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [name, SECRET_KEY.test(name) ? REDACTED : redactText(value)]),
  )
}
