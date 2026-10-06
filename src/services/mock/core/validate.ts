import type { z } from 'zod'
import { ApiError, type ApiFieldErrors } from '@/services/api/errors'

/**
 * Parses a payload the way a server would: bad input becomes a VALIDATION error carrying
 * per-field messages the form can show.
 */
export function parseInput<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input)
  if (result.success) return result.data
  const fieldErrors: ApiFieldErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_'
    ;(fieldErrors[key] ??= []).push(issue.message)
  }
  const first = result.error.issues[0]?.message ?? 'Invalid input.'
  throw new ApiError('VALIDATION', first, fieldErrors)
}

export function validationError(field: string, message: string): ApiError {
  return new ApiError('VALIDATION', message, { [field]: [message] })
}
