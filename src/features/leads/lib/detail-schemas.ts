import { z } from 'zod'
import { CALL_OUTCOMES, QUALIFICATION_STATUSES } from '@/types'
import { emailField, isoDate, moneyField, phoneField } from '@/types/schemas/shared'

export const noteComposerSchema = z.object({
  text: z.string().trim().min(1, 'Write a note'),
})

export const callComposerSchema = z.object({
  outcome: z.enum(CALL_OUTCOMES),
  durationMinutes: z.number().min(0, 'Duration cannot be negative'),
  notes: z.string().trim(),
})

export const meetingComposerSchema = z.object({
  startsAt: isoDate('Pick a date'),
  attendees: z.string().trim(),
  notes: z.string().trim(),
})

export const emailComposerSchema = z.object({
  subject: z.string().trim().min(1, 'Add a subject'),
  body: z.string().trim().min(1, 'Write the email'),
})

const dealFields = {
  title: z.string().trim().min(2, 'Add a deal title').max(160),
  value: moneyField,
  expectedCloseDate: isoDate('Pick an expected close date'),
  probability: z.number().min(0).max(100),
  product: z.string().trim().min(1, 'Enter the product or service').max(120),
  ownerId: z.string().min(1, 'Select an owner'),
  pipelineId: z.string().min(1, 'Select a pipeline'),
  stageId: z.string().min(1, 'Select a stage'),
}

export const convertDealFormSchema = z.object(dealFields)

export const convertCustomerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
    phone: phoneField,
    email: emailField,
    companyName: z.string().trim().max(120),
    location: z.string().trim().max(120),
    createDeal: z.boolean(),
    title: z.string(),
    value: z.number(),
    expectedCloseDate: z.string(),
    probability: z.number(),
    product: z.string(),
    ownerId: z.string(),
    pipelineId: z.string(),
    stageId: z.string(),
  })
  .superRefine((value, ctx) => {
    if (!value.createDeal) return
    const parsed = z.object(dealFields).safeParse(value)
    if (parsed.success) return
    for (const issue of parsed.error.issues) {
      ctx.addIssue({ code: 'custom', message: issue.message, path: issue.path })
    }
  })

export const qualificationFormSchema = z.object({
  qualificationStatus: z.enum(QUALIFICATION_STATUSES),
  notes: z.string().trim(),
})

export type NoteComposerValues = z.infer<typeof noteComposerSchema>
export type CallComposerValues = z.infer<typeof callComposerSchema>
export type MeetingComposerValues = z.infer<typeof meetingComposerSchema>
export type EmailComposerValues = z.infer<typeof emailComposerSchema>
export type ConvertDealFormValues = z.infer<typeof convertDealFormSchema>
export type ConvertCustomerValues = z.infer<typeof convertCustomerSchema>
