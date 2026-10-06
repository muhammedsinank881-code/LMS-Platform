import { compareContacts, normalizeEmail } from '@/lib/duplicates'
import { normalizePhone } from '@/lib/phone'
import type { Lead } from '@/types'

export interface ContactProbe {
  phone?: string | null
  email?: string | null
}

/** First high-confidence lead whose phone, WhatsApp or email matches the contact. */
export function matchLeadByContact(leads: readonly Lead[], probe: ContactProbe): Lead | null {
  const phone = normalizePhone(probe.phone)
  const email = normalizeEmail(probe.email)
  if (!phone && !email) return null

  let best: Lead | null = null
  for (const lead of leads) {
    if (lead.archivedAt) continue
    const match = compareContacts(
      { phone, email, whatsapp: phone },
      { phone: lead.phone, email: lead.email, whatsapp: lead.whatsapp, company: lead.company },
    )
    if (!match) continue
    if (match.confidence === 'high') return lead
    if (!best && match.confidence === 'medium') best = lead
  }
  return best
}

export function contactLabel(input: {
  contactName?: string | null
  contactPhone?: string | null
  contactEmail?: string | null
  leadName?: string | null
}): string {
  return input.leadName || input.contactName || input.contactPhone || input.contactEmail || 'Unknown'
}
