import { z } from 'zod'
import { normalizePhone } from '@/lib/phone'
import { isCustomerId, isDealId, isLeadId, type CustomerId, type DealId, type LeadId } from '../ids'

/** Optional free text. Forms may send '' for an untouched field. */
export const optionalText = (max = 200) => z.string().trim().max(max).nullish()

export const isoDate = (message = 'Enter a valid date') =>
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), message)

export const phoneField = z
  .string()
  .trim()
  .refine((value) => value === '' || normalizePhone(value) !== null, 'Enter a valid phone number')
  .nullish()

export const emailField = z.union([z.literal(''), z.email('Enter a valid email address')]).nullish()

export const leadIdField = z.custom<LeadId>(
  (value) => typeof value === 'string' && isLeadId(value),
  'Select a lead',
)
export const dealIdField = z.custom<DealId>(
  (value) => typeof value === 'string' && isDealId(value),
  'Select a deal',
)
export const customerIdField = z.custom<CustomerId>(
  (value) => typeof value === 'string' && isCustomerId(value),
  'Select a customer',
)

export const answerValue = z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
export const customFieldValue = z.union([answerValue, z.null()])
export const customFieldsRecord = z.record(z.string(), customFieldValue)

/** Money amounts: whole rupees or paise, never negative, with a sane ceiling. */
export const moneyField = z.number().min(0, 'Must be 0 or more').max(1_000_000_000_000)
