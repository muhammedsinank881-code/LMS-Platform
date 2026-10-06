import { z } from 'zod'
import { PRIORITIES } from '../common'
import { LEAD_TYPES, QUALIFICATION_STATUSES } from '../lead'
import {
  answerValue,
  customFieldsRecord,
  emailField,
  moneyField,
  optionalText,
  phoneField,
} from './shared'

const leadFields = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  phone: phoneField,
  whatsapp: phoneField,
  email: emailField,
  company: optionalText(120),
  location: optionalText(120),
  sourceId: z.string().min(1, 'Select a source'),
  campaignId: z.string().nullish(),
  productInterest: optionalText(120),
  budget: moneyField.nullish(),
  requirement: optionalText(1000),
  leadType: z.enum(LEAD_TYPES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  language: optionalText(60),
  tags: z.array(z.string().trim().min(1).max(40)).optional(),
  statusId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
  assignedTo: z.string().nullish(),
  qualificationStatus: z.enum(QUALIFICATION_STATUSES).optional(),
  qualificationAnswers: z.record(z.string(), answerValue).optional(),
  customFields: customFieldsRecord.optional(),
})

const hasContact = (lead: {
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
}) => Boolean(lead.phone || lead.whatsapp || lead.email)

/** A lead needs at least one way to reach the person. */
export const createLeadSchema = leadFields.refine(hasContact, {
  message: 'Add a phone number, WhatsApp number or email',
  path: ['phone'],
})

export const updateLeadSchema = leadFields.partial()

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
