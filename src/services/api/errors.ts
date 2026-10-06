export type ApiErrorCode =
  // Authentication and workspace membership.
  | 'invalid_credentials'
  | 'email_taken'
  | 'invalid_invitation'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'unknown'
  // Domain data layer.
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'VALIDATION'
  | 'CONFLICT'

/** Field name to messages, for errors the UI can show beside a form control. */
export type ApiFieldErrors = Record<string, string[]>

/** What every ApiClient (mock or real) throws, so UI code never depends on the transport. */
export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly fieldErrors?: ApiFieldErrors

  constructor(code: ApiErrorCode, message: string, fieldErrors?: ApiFieldErrors) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

/** Codes that retrying cannot fix: the same request would fail again. */
const PERMANENT_CODES: ReadonlySet<string> = new Set([
  'forbidden',
  'not_found',
  'unauthorized',
  'invalid_credentials',
  'email_taken',
  'invalid_invitation',
  'validation',
  'conflict',
])

/** True for client errors (permission, missing record, bad input, conflict) that are not transient. */
export function isPermanentError(error: unknown): boolean {
  return error instanceof ApiError && PERMANENT_CODES.has(error.code.toLowerCase())
}

/** Case-insensitive code check, since auth codes are lowercase and data-layer codes uppercase. */
export function hasErrorCode(error: unknown, code: string): boolean {
  return error instanceof ApiError && error.code.toLowerCase() === code.toLowerCase()
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Try again.') {
  if (!(error instanceof ApiError) || !error.message || error.message.includes('\n')) return fallback
  return error.message
}
