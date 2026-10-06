import { z } from 'zod'
import { API_SCOPES } from '../api-key'
import { ASSIGN_MODES } from '../integration'
import { FORM_INPUT_TYPES } from '../lead-form'
import { WEBHOOK_EVENTS } from '../webhook'

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex color like #4f46e5')

export const leadDefaultsSchema = z
  .object({
    sourceId: z.string().nullable(),
    campaignId: z.string().nullable(),
    statusId: z.string().nullable(),
    tags: z.array(z.string().trim().min(1).max(40)),
    assignMode: z.enum(ASSIGN_MODES),
    assignUserId: z.string().nullable(),
  })
  .refine((value) => value.assignMode !== 'specific_user' || Boolean(value.assignUserId), {
    message: 'Pick who receives these leads',
    path: ['assignUserId'],
  })

export const leadFormFieldSchema = z
  .object({
    id: z.string().min(1),
    key: z.string().min(1, 'Pick a lead field'),
    label: z.string().trim().min(1, 'Add a label').max(80),
    placeholder: z.string().max(120),
    required: z.boolean(),
    type: z.enum(FORM_INPUT_TYPES),
    options: z.array(z.string().trim().min(1)),
    validation: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().max(200).optional(),
    }),
  })
  .refine((field) => field.type !== 'select' || field.options.length >= 2, {
    message: 'A dropdown needs at least two options',
    path: ['options'],
  })
  .refine((field) => field.validation.min === undefined || field.validation.max === undefined || field.validation.min <= field.validation.max, {
    message: 'Minimum must not exceed maximum',
    path: ['validation'],
  })
  .refine(
    (field) => {
      if (!field.validation.pattern) return true
      try {
        new RegExp(field.validation.pattern)
        return true
      } catch {
        return false
      }
    },
    { message: 'That pattern is not a valid regular expression', path: ['validation'] },
  )

const CONTACT_KEYS = ['phone', 'whatsapp', 'email']

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, 'Name the form').max(80),
  fields: z
    .array(leadFormFieldSchema)
    .min(1, 'Add at least one field')
    .refine((fields) => new Set(fields.map((f) => f.key)).size === fields.length, 'Each lead field can appear once')
    .refine((fields) => fields.some((f) => f.key === 'name'), 'A form needs a name field')
    .refine((fields) => fields.some((f) => CONTACT_KEYS.includes(f.key)), 'Ask for a phone, WhatsApp number or email'),
  submitLabel: z.string().trim().min(1, 'Add button text').max(40),
  successMessage: z.string().trim().min(1, 'Add a thank-you message').max(300),
  redirectUrl: z.union([z.literal(''), z.url('Enter a full URL, like https://example.com/thanks')]).nullable(),
  consentText: z.string().max(300).nullable(),
  spamProtection: z.boolean(),
  defaults: leadDefaultsSchema,
  notifyUserIds: z.array(z.string()),
  style: z.object({ accent: hexColor, theme: z.enum(['light', 'dark']), rounded: z.boolean() }),
})
export type LeadFormValues = z.infer<typeof leadFormSchema>

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/

export const createApiKeySchema = z.object({
  name: z.string().trim().min(2, 'Name the key').max(60),
  scopes: z
    .array(z.enum(API_SCOPES))
    .min(1, 'Pick at least one scope'),
  ipAllowlist: z
    .array(z.string().trim().regex(IPV4, 'Use an IPv4 address or CIDR range'))
    .optional(),
  expiresAt: z
    .string()
    .nullable()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), 'Enter a valid date'),
})
export type CreateApiKeyValues = z.infer<typeof createApiKeySchema>

const RESERVED_HEADERS = ['content-type', 'x-leadflow-signature', 'x-leadflow-event', 'user-agent']

export const webhookSchema = z.object({
  url: z
    .string()
    .trim()
    .pipe(z.url('Enter a full URL'))
    .refine((value) => value.startsWith('https://'), 'The URL must start with https://'),
  description: z.string().trim().max(160),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1, 'Pick at least one event'),
  enabled: z.boolean(),
  headers: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .regex(/^[A-Za-z0-9-]+$/, 'Header names use letters, numbers and dashes')
          .refine((name) => !RESERVED_HEADERS.includes(name.toLowerCase()), 'That header is set by LeadFlow'),
        value: z.string().optional(),
      }),
    )
    .max(5, 'Up to 5 headers'),
  filter: z.object({ sourceIds: z.array(z.string()) }).nullable(),
})
export type WebhookValues = z.infer<typeof webhookSchema>
