import type { Lead, User } from '@/types'

/** Stand-in data for template previews, so an author sees a realistic message before sending. */
export const SAMPLE_LEAD: Pick<Lead, 'name' | 'company' | 'phone' | 'email' | 'customFields'> = {
  name: 'Riya Shah',
  company: 'Shah Traders',
  phone: '+919876543210',
  email: 'riya@shahtraders.in',
  customFields: {},
}

export const SAMPLE_OWNER: Pick<User, 'name'> = { name: 'Ananya Singh' }
