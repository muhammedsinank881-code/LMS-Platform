import { leadFormSchema, type LeadFormInput } from '@/types'

/** First message per top-level path (`name`, `fields`, `defaults`, ...) for showing beside the control. */
export function validateDraft(draft: LeadFormInput): Record<string, string> {
  const result = leadFormSchema.safeParse(draft)
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const path = issue.path[0] === 'defaults' ? 'defaults' : issue.path[0] === 'fields' && issue.path.length > 1 ? `field:${String(issue.path[1])}` : String(issue.path[0] ?? '_')
    errors[path] ??= issue.message
  }
  return errors
}
