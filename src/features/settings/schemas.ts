import { z } from 'zod'

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Use at least 8 characters.'),
    nextPassword: z.string().min(8, 'Use at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Use at least 8 characters.'),
  })
  .refine((values) => values.nextPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export type PasswordValues = z.infer<typeof passwordSchema>

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  phone: z.string(),
  language: z.string().min(1, 'Choose a language.'),
  timezone: z.string().min(1, 'Choose a timezone.'),
})

export type ProfileValues = z.infer<typeof profileSchema>

export const workspaceSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  currency: z.string().min(1),
  timezone: z.string().min(1),
  dateFormat: z.string().min(1),
  fiscalYearStart: z.number().int().min(1).max(12),
  hoursStart: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm.'),
  hoursEnd: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm.'),
  defaultStatusId: z.string(),
  fallbackUserId: z.string(),
})

export type WorkspaceValues = z.infer<typeof workspaceSchema>

export const scoringRuleSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required.').max(80),
    isActive: z.boolean(),
    /** Condition rows keep every field the filter row needs (value, operator, ...). */
    conditions: z.array(z.looseObject({ field: z.string().min(1), operator: z.string().min(1) })),
    points: z
      .number({ message: 'Enter the points.' })
      .int('Use a whole number.')
      .min(-100, 'Between -100 and 100.')
      .max(100, 'Between -100 and 100.')
      .refine((value) => value !== 0, 'Points cannot be 0.'),
    repeat: z.boolean(),
    repeatField: z.string(),
    maxApplications: z.number({ message: 'Enter a number.' }).int().min(1, 'At least 1.').max(20, 'At most 20.'),
  })
  .refine((values) => !values.repeat || values.repeatField.length > 0, {
    path: ['repeatField'],
    message: 'Choose the signal to count.',
  })

export type ScoringRuleValues = z.infer<typeof scoringRuleSchema>
