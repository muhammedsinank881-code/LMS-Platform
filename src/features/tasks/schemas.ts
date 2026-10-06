import { z } from 'zod'
import {
  PRIORITIES,
  isDealId,
  isLeadId,
  type CreateTaskInput,
  type DealId,
  type LeadId,
  type ReminderOffsetMinutes,
} from '@/types'

const OFFSETS: readonly ReminderOffsetMinutes[] = [0, 15, 60, 1440]

export const taskFormSchema = z.object({
  title: z.string().trim().min(2, 'Add a short title').max(160),
  description: z.string().max(2000).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  priority: z.enum(PRIORITIES),
  assigneeId: z.string().min(1, 'Choose an assignee'),
  reminder: z.enum(['none', '0', '15', '60', '1440']),
  leadId: z.string().optional(),
  dealId: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'done']).optional(),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

export function toCreateTaskInput(values: TaskFormValues): CreateTaskInput {
  const dueAt = values.date ? combine(values.date, values.time || '09:00') : null
  const offset = values.reminder === 'none' ? null : OFFSETS.find((item) => item === Number(values.reminder)) ?? null
  const reminderAt =
    dueAt && offset !== null ? new Date(new Date(dueAt).getTime() - offset * 60_000).toISOString() : null
  return {
    title: values.title.trim(),
    description: values.description?.trim() ?? '',
    dueAt,
    priority: values.priority,
    assigneeId: values.assigneeId,
    reminderAt,
    leadId: values.leadId && isLeadId(values.leadId) ? (values.leadId as LeadId) : null,
    dealId: values.dealId && isDealId(values.dealId) ? (values.dealId as DealId) : null,
  }
}

function combine(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return new Date(year, (month ?? 1) - 1, day, hour, minute, 0, 0).toISOString()
}
