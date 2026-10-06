import { AUTOMATION_FIELDS, fieldLabel } from '@/lib/automation'
import { LEAD_FILTER_FIELDS } from '@/types'

export const UNIT_OPTIONS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
]

export const WEEKDAY_OPTIONS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((name, value) => ({
  value: String(value),
  label: name,
}))

const LEAD_FIELD_IDS: readonly string[] = LEAD_FILTER_FIELDS

/** Lead fields a "field changed" trigger can watch. */
export const WATCHABLE_FIELDS = AUTOMATION_FIELDS.filter((f) => f.group === 'Lead' && LEAD_FIELD_IDS.includes(f.id)).map((f) => ({
  value: f.id,
  label: fieldLabel(f.id),
}))
