import { z } from 'zod'
import { CAMPAIGN_OBJECTIVES, CAMPAIGN_PLATFORMS, CAMPAIGN_STATUSES } from '@/types'
import type { CampaignInput } from '@/services/api/campaigns'

const day = /^\d{4}-\d{2}-\d{2}$/

export const campaignFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Add a campaign name').max(120),
    platform: z.enum(CAMPAIGN_PLATFORMS),
    objective: z.enum(CAMPAIGN_OBJECTIVES),
    status: z.enum(CAMPAIGN_STATUSES),
    budget: z.coerce.number({ message: 'Enter a budget' }).min(0, 'Budget cannot be negative'),
    startDate: z.string().regex(day, 'Pick a start date'),
    endDate: z.string().regex(day, 'Pick an end date').or(z.literal('')),
    ownerId: z.string().min(1, 'Pick an owner'),
    tags: z.string().max(200).optional(),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    path: ['endDate'],
    message: 'The end date must be on or after the start date',
  })

export type CampaignFormInput = z.input<typeof campaignFormSchema>
export type CampaignFormValues = z.output<typeof campaignFormSchema>

export function toCampaignInput(values: CampaignFormValues): CampaignInput {
  return {
    name: values.name,
    platform: values.platform,
    objective: values.objective,
    status: values.status,
    budget: values.budget,
    startDate: new Date(`${values.startDate}T00:00:00.000Z`).toISOString(),
    endDate: values.endDate ? new Date(`${values.endDate}T00:00:00.000Z`).toISOString() : null,
    ownerId: values.ownerId,
    tags: (values.tags ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  }
}

export const spendFormSchema = z.object({
  date: z.string().regex(day, 'Pick a date'),
  amount: z.coerce.number({ message: 'Enter an amount' }).gt(0, 'Enter an amount above zero'),
  adSetId: z.string().optional(),
  adId: z.string().optional(),
  notes: z.string().max(300).optional(),
})
export type SpendFormInput = z.input<typeof spendFormSchema>
export type SpendFormValues = z.output<typeof spendFormSchema>
