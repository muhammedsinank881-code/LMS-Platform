import type { CustomFieldDefinition } from '@/types'
import { activeFields } from '@/lib/settings/custom-field'

export interface ImportTarget {
  id: string
  label: string
}

const BASE: ImportTarget[] = [
  { id: 'name', label: 'Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'email', label: 'Email' },
  { id: 'company', label: 'Company' },
  { id: 'sourceId', label: 'Source' },
  { id: 'statusId', label: 'Status' },
]

/** Column targets for the import mapper, including active lead custom fields. */
export function importTargets(fields: readonly CustomFieldDefinition[]): ImportTarget[] {
  return [
    ...BASE,
    ...activeFields(fields, 'lead').map((field) => ({ id: `cf:${field.key}`, label: field.label })),
  ]
}
