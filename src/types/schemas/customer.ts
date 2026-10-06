import { z } from 'zod'
import { customFieldsRecord, emailField, leadIdField, moneyField, phoneField } from './shared'

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  phone: phoneField,
  email: emailField,
  companyId: z.string().nullish(),
  originLeadId: leadIdField.nullish(),
  /** Defaults to the current user when omitted. */
  ownerId: z.string().optional(),
  lifetimeValue: moneyField.optional(),
  tags: z.array(z.string().trim().min(1).max(40)).optional(),
  customFields: customFieldsRecord.optional(),
})

export const updateCustomerSchema = createCustomerSchema.omit({ originLeadId: true }).partial()

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
