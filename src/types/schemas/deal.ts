import { z } from 'zod'
import { customFieldsRecord, isoDate, leadIdField, moneyField } from './shared'

export const createDealSchema = z.object({
  title: z.string().trim().min(2, 'Add a deal title').max(160),
  leadId: leadIdField,
  value: moneyField,
  expectedCloseDate: isoDate('Pick an expected close date'),
  /** Defaults to the stage's probability when omitted. */
  probability: z.number().min(0).max(100).optional(),
  product: z.string().trim().min(1, 'Enter the product or service').max(120),
  /** Defaults to the current user when omitted. */
  ownerId: z.string().optional(),
  pipelineId: z.string().min(1, 'Select a pipeline'),
  stageId: z.string().min(1, 'Select a stage'),
  customFields: customFieldsRecord.optional(),
})

/** Stage moves go through `deals.moveStage`, so the stage is not editable here. */
export const updateDealSchema = createDealSchema.omit({ leadId: true, stageId: true }).partial()

export type CreateDealInput = z.infer<typeof createDealSchema>
export type UpdateDealInput = z.infer<typeof updateDealSchema>
