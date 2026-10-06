import {
  LEAD_CAPTURE_FIELDS,
  type CustomFieldDefinition,
  type CustomFieldValue,
  type FieldMapping,
  type IngestPayload,
  type MappedLead,
} from '@/types'

const STANDARD = new Set<string>(LEAD_CAPTURE_FIELDS)
const CUSTOM_PREFIX = 'custom.'

type CustomType = Pick<CustomFieldDefinition, 'key' | 'type'>

/** Flattens a provider payload to `question -> answer`, the shape field mapping works on. */
export function rawFromPayload(payload: IngestPayload): Record<string, string> {
  switch (payload.shape) {
    case 'meta':
      return Object.fromEntries(payload.fieldData.map((item) => [item.name, item.values.join(', ')]))
    case 'google':
      return Object.fromEntries(payload.userColumnData.map((item) => [item.columnId, item.stringValue]))
    case 'linkedin':
      return Object.fromEntries(payload.answers.map((item) => [item.question, item.answer]))
    case 'whatsapp':
      return { name: payload.name ?? '', phone: payload.from, whatsapp: payload.from, requirement: payload.text }
    case 'telephony':
      return { name: payload.name ?? '', phone: payload.from }
    case 'form':
      return payload.values
    case 'api':
      return Object.fromEntries(
        Object.entries(payload.data).flatMap(([key, value]) => (value === null ? [] : [[key, String(value)]])),
      )
  }
}

function coerce(value: string, type: CustomFieldDefinition['type'] | undefined): CustomFieldValue {
  switch (type) {
    case 'number':
    case 'currency': {
      const parsed = Number(value.replace(/[,₹\s]/g, ''))
      return Number.isNaN(parsed) ? null : parsed
    }
    case 'boolean':
      return /^(true|yes|y|1)$/i.test(value)
    case 'multiselect':
      return value.split(',').map((item) => item.trim()).filter(Boolean)
    default:
      return value
  }
}

/**
 * Applies a form's field mapping to flattened answers. A question without a mapping still lands
 * when its name is already a lead field (or `custom.<key>`); anything else is reported unmapped.
 * Empty answers are skipped, and the first answer wins when two questions map to one field.
 */
export function applyFieldMapping(
  raw: Record<string, string>,
  mapping: readonly FieldMapping[],
  customFields: readonly CustomType[] = [],
): MappedLead {
  const byQuestion = new Map(mapping.map((item) => [item.sourceField.toLowerCase(), item.leadField]))
  const result: MappedLead = { standard: {}, custom: {}, unmapped: [] }
  for (const [question, answer] of Object.entries(raw)) {
    const value = answer.trim()
    if (!value) continue
    const target = byQuestion.get(question.toLowerCase()) ?? (isKnownField(question) ? question : null)
    if (!target) {
      result.unmapped.push(question)
      continue
    }
    if (target.startsWith(CUSTOM_PREFIX)) {
      const key = target.slice(CUSTOM_PREFIX.length)
      if (!(key in result.custom)) result.custom[key] = coerce(value, customFields.find((f) => f.key === key)?.type)
    } else if (!(target in result.standard)) {
      result.standard[target] = value
    }
  }
  return result
}

const isKnownField = (name: string) => STANDARD.has(name) || name.startsWith(CUSTOM_PREFIX)

export function parseBudget(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Number(value.replace(/[^0-9.]/g, ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}
