import type { LeadId } from './ids'
import type { CustomFieldValue, DuplicateMatch } from './lead'
import type { FieldMapping, LeadDefaults } from './integration'
import type { Utm } from './lead-form'

export const INGEST_PROVIDERS = [
  'facebook_lead_ads',
  'instagram',
  'google_ads',
  'linkedin',
  'whatsapp',
  'website',
  'form',
  'api',
  'telephony',
] as const
export type IngestProvider = (typeof INGEST_PROVIDERS)[number]

/** What each provider hands over. Shapes mirror the real webhooks closely enough to swap later. */
export type IngestPayload =
  | { shape: 'meta'; formId: string; fieldData: Array<{ name: string; values: string[] }> }
  | { shape: 'google'; formId: string; userColumnData: Array<{ columnId: string; stringValue: string }> }
  | { shape: 'linkedin'; formId: string; answers: Array<{ question: string; answer: string }> }
  | { shape: 'whatsapp'; from: string; name?: string; text: string }
  | { shape: 'form'; values: Record<string, string> }
  | { shape: 'api'; data: Record<string, string | number | boolean | null> }
  | { shape: 'telephony'; from: string; name?: string }

export interface SourceContext {
  provider: IngestProvider
  integrationId?: string | null
  /** Internal capture form id, for forms we host. */
  captureFormId?: string | null
  mapping?: FieldMapping[]
  defaults?: Partial<LeadDefaults>
  utm?: Utm
}

export interface MappedLead {
  standard: Record<string, string>
  custom: Record<string, CustomFieldValue>
  unmapped: string[]
}

export interface IngestResult {
  leadId: LeadId
  duplicates: DuplicateMatch[]
  assignedTo: string | null
  campaignMatched: boolean
}
