import { normalizePhone } from '@/lib/phone'
import type { LeadFormField, PublicLeadForm } from '@/types'

export type SubmissionErrors = Record<string, string>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateField(field: LeadFormField, raw: string | undefined): string | null {
  const value = (raw ?? '').trim()
  if (!value) return field.required ? `${field.label} is required` : null
  const { min, max, pattern } = field.validation
  if (field.type === 'email' && !EMAIL.test(value)) return 'Enter a valid email address'
  if (field.type === 'tel' && normalizePhone(value) === null) return 'Enter a valid phone number'
  if (field.type === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return 'Enter a number'
    if (min !== undefined && n < min) return `Must be at least ${min}`
    if (max !== undefined && n > max) return `Must be at most ${max}`
  } else {
    if (min !== undefined && value.length < min) return `Use at least ${min} characters`
    if (max !== undefined && value.length > max) return `Use at most ${max} characters`
  }
  if (field.type === 'select' && !field.options.includes(value)) return 'Choose one of the options'
  if (pattern && !new RegExp(pattern).test(value)) return `${field.label} is not in the expected format`
  return null
}

/** Checks a public submission against the form's own rules. The mock server runs the same function. */
export function validateSubmission(
  form: Pick<PublicLeadForm, 'fields' | 'consentText'>,
  values: Record<string, string>,
  consent: boolean,
): SubmissionErrors {
  const errors: SubmissionErrors = {}
  for (const field of form.fields) {
    const message = validateField(field, values[field.key])
    if (message) errors[field.key] = message
  }
  if (form.consentText && !consent) errors.consent = 'Please agree to continue'
  return errors
}
