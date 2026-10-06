import { z } from 'zod'
import {
  PRIORITIES,
  FOLLOWUP_TYPES,
  isLeadId,
  type CreateFollowUpInput,
  type LeadId,
  type ReminderOffsetMinutes,
} from '@/types'

const OFFSETS: readonly ReminderOffsetMinutes[] = [0, 15, 60, 1440]

export const followUpFormSchema = z.object({
  leadId: z.string().min(1, 'Select a lead'),
  type: z.enum(FOLLOWUP_TYPES),
  date: z.string().min(1, 'Pick a date'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Pick a time'),
  assigneeId: z.string().min(1, 'Choose an assignee'),
  priority: z.enum(PRIORITIES),
  notes: z.string().max(1000).optional(),
  reminder: z.enum(['none', '0', '15', '60', '1440']),
})

export type FollowUpFormValues = z.infer<typeof followUpFormSchema>

export function reminderFromForm(value: FollowUpFormValues['reminder']): ReminderOffsetMinutes | null {
  if (value === 'none') return null
  const parsed = Number(value)
  return OFFSETS.find((item) => item === parsed) ?? null
}

export function toCreateFollowUpInput(values: FollowUpFormValues, dueAt: string): CreateFollowUpInput {
  if (!isLeadId(values.leadId)) {
    throw new Error('Select a lead')
  }
  return {
    leadId: values.leadId as LeadId,
    type: values.type,
    dueAt,
    assigneeId: values.assigneeId,
    priority: values.priority,
    notes: values.notes?.trim() ?? '',
    reminderOffsetMinutes: reminderFromForm(values.reminder),
  }
}
