import { z } from 'zod'
import { PRIORITIES } from '../common'
import { dealIdField, isoDate, leadIdField, optionalText } from './shared'

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, 'Add a short title').max(160),
  description: optionalText(2000),
  dueAt: isoDate('Pick a due date').nullish(),
  priority: z.enum(PRIORITIES),
  /** Defaults to the current user when omitted. */
  assigneeId: z.string().optional(),
  reminderAt: isoDate().nullish(),
  leadId: leadIdField.nullish(),
  dealId: dealIdField.nullish(),
})

export const updateTaskSchema = createTaskSchema
  .partial()
  .extend({ status: z.enum(['open', 'in_progress', 'done']).optional() })

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
