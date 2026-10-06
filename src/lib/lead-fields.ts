import { ENGAGEMENT_SIGNALS, LEAD_FILTER_FIELDS, type EngagementSignal, type Lead, type LeadFilterField } from '@/types'
import type { FieldValue } from './filters'
import { bucketOf } from './followup-buckets'

export interface LeadFieldContext {
  now: Date
  /** Resolves the team of a user, for the virtual `teamId` field. */
  teamOf?: (userId: string) => string | null
}

type StoredLeadField = Exclude<LeadFilterField, 'teamId' | 'followUpBucket' | 'isDuplicate'>

/**
 * Value of a filterable field on a lead (or an unsaved draft). One definition shared by the
 * list engine, scoring rules, assignment rules and automations, so "Source = Facebook" means
 * the same thing everywhere.
 */
export function getLeadFieldValue(
  lead: Partial<Lead>,
  field: LeadFilterField,
  context: LeadFieldContext,
): FieldValue {
  switch (field) {
    case 'teamId':
      return lead.assignedTo ? (context.teamOf?.(lead.assignedTo) ?? null) : null
    case 'followUpBucket':
      return lead.nextFollowUpAt ? bucketOf(lead.nextFollowUpAt, context.now) : 'none'
    case 'isDuplicate':
      return Boolean(lead.duplicateOf)
    default: {
      const stored: StoredLeadField = field
      return lead[stored] ?? null
    }
  }
}

const LEAD_FIELD_KEYS: readonly string[] = LEAD_FILTER_FIELDS
const ENGAGEMENT_PREFIX = 'engagement.'
const CUSTOM_PREFIX = 'custom.'

/**
 * Like `getLeadFieldValue` but also resolves `engagement.<signal>` counters and
 * `custom.<key>` custom fields, so scoring rules and automations can use them.
 * Unknown fields resolve to `undefined` (a condition on them simply does not match).
 */
export function getExtendedLeadFieldValue(
  lead: Partial<Lead>,
  field: string,
  context: LeadFieldContext,
): FieldValue {
  if (field.startsWith(ENGAGEMENT_PREFIX)) {
    const signal = field.slice(ENGAGEMENT_PREFIX.length) as EngagementSignal
    return ENGAGEMENT_SIGNALS.includes(signal) ? (lead.engagement?.[signal] ?? 0) : undefined
  }
  if (field.startsWith(CUSTOM_PREFIX)) {
    const value = lead.customFields?.[field.slice(CUSTOM_PREFIX.length)]
    return value ?? null
  }
  if (!LEAD_FIELD_KEYS.includes(field)) return undefined
  return getLeadFieldValue(lead, field as LeadFilterField, context)
}
