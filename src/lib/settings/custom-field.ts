import type { CustomFieldDefinition, CustomFieldType } from '@/types'

const KEY_PATTERN = /^[a-z][a-z0-9_]*$/

/** Stable key from a label. Immutable after the field is saved. */
export function fieldKeyFromLabel(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  const safe = slug.replace(/^[^a-z]+/, '')
  return safe.slice(0, 40) || 'field'
}

export function uniqueOptions(options: readonly string[]): string[] | null {
  const seen = new Set<string>()
  const next: string[] = []
  for (const raw of options) {
    const option = raw.trim()
    if (!option) return null
    const folded = option.toLowerCase()
    if (seen.has(folded)) return null
    seen.add(folded)
    next.push(option)
  }
  return next
}

export function needsOptions(type: CustomFieldType): boolean {
  return type === 'dropdown' || type === 'multiselect'
}

export function isArchived(field: Pick<CustomFieldDefinition, 'archived'>): boolean {
  return field.archived === true
}

export function activeFields(
  fields: readonly CustomFieldDefinition[],
  entity: CustomFieldDefinition['entity'],
): CustomFieldDefinition[] {
  return fields
    .filter((field) => field.entity === entity && !isArchived(field))
    .sort((a, b) => a.order - b.order)
}

export function validateFieldKey(key: string): string | null {
  if (!KEY_PATTERN.test(key)) return 'Use lowercase letters, numbers, and underscores.'
  return null
}
