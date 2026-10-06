import { z } from 'zod'
import { PRIORITIES } from '../common'
import { FOLLOWUP_OUTCOMES, FOLLOWUP_TYPES, REMINDER_OFFSETS } from '../followup'
import { isoDate, leadIdField, optionalText } from './shared'

export const reminderOffsetSchema = z.union([
  z.literal(REMINDER_OFFSETS[0]),
  z.literal(REMINDER_OFFSETS[1]),
  z.literal(REMINDER_OFFSETS[2]),
  z.literal(REMINDER_OFFSETS[3]),
])

export const createFollowUpSchema = z.object({
  leadId: leadIdField,
  type: z.enum(FOLLOWUP_TYPES),
  dueAt: isoDate('Pick a date and time'),
  /** Defaults to the current user when omitted. */
  assigneeId: z.string().optional(),
  priority: z.enum(PRIORITIES),
  notes: optionalText(1000),
  reminderOffsetMinutes: reminderOffsetSchema.nullish(),
  /** When set, the follow-up is linked to this deal instead of the lead's first one. */
  dealId: z.string().optional(),
})

export const updateFollowUpSchema = createFollowUpSchema.omit({ leadId: true }).partial()

export const completeFollowUpSchema = z.object({
  outcome: z.enum(FOLLOWUP_OUTCOMES).optional(),
  note: optionalText(1000),
})

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>
export type CompleteFollowUpFormInput = z.infer<typeof completeFollowUpSchema>
