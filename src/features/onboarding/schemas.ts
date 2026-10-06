import { z } from 'zod'

export const IMPORT_CHOICES = ['import', 'skip'] as const
export const MAX_INVITES = 10

/** Splits a free-text list ("a@x.com, b@x.com\nc@x.com") into unique, lowercased emails. */
export function parseEmailList(input: string): string[] {
  const emails = input
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  return [...new Set(emails)]
}

export const onboardingSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, 'Enter a workspace name')
    .max(60, 'Keep it under 60 characters'),
  currency: z.string().min(1, 'Choose a currency'),
  timezone: z.string().min(1, 'Choose a timezone'),
  importChoice: z.enum(IMPORT_CHOICES),
  inviteEmails: z.string().superRefine((value, ctx) => {
    const emails = parseEmailList(value)
    const invalid = emails.filter((email) => !z.email().safeParse(email).success)
    if (invalid.length > 0) {
      ctx.addIssue({ code: 'custom', message: `Not a valid email: ${invalid.join(', ')}` })
    } else if (emails.length > MAX_INVITES) {
      ctx.addIssue({ code: 'custom', message: `Invite up to ${MAX_INVITES} people for now` })
    }
  }),
})
export type OnboardingValues = z.infer<typeof onboardingSchema>
