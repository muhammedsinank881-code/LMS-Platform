import type { CustomFieldValue, LeadDefaults, MappedLead } from '@/types'
import { parseBudget } from './field-mapping'

export interface ResolvedDefaults extends Omit<LeadDefaults, 'sourceId'> {
  sourceId: string
}

/** A name for leads whose form had no name field, so a WhatsApp number still becomes a lead. */
function fallbackName(mapped: MappedLead): string {
  const { name, company, email, phone } = mapped.standard
  return name || company || email?.split('@')[0] || phone || 'Unknown lead'
}

/**
 * The create-lead payload for mapped answers plus defaults. Pure: it only shapes data. The
 * assignee is set here only for "specific user"; rules and round-robin are resolved by the
 * create pipeline and the ingest step.
 */
export function buildLeadInput(mapped: MappedLead, defaults: ResolvedDefaults, extras: { campaignId?: string | null } = {}) {
  const { standard } = mapped
  const customFields: Record<string, CustomFieldValue> = { ...mapped.custom }
  return {
    name: fallbackName(mapped),
    phone: standard.phone,
    whatsapp: standard.whatsapp,
    email: standard.email,
    company: standard.company,
    location: standard.location,
    productInterest: standard.productInterest,
    requirement: standard.requirement,
    language: standard.language,
    budget: parseBudget(standard.budget),
    sourceId: defaults.sourceId,
    campaignId: extras.campaignId ?? defaults.campaignId,
    statusId: defaults.statusId ?? undefined,
    tags: defaults.tags,
    assignedTo: defaults.assignMode === 'specific_user' ? defaults.assignUserId : undefined,
    customFields,
  }
}
