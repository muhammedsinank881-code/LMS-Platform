import { PRIORITIES, LEAD_TYPES } from '@/types'
import { PickOne, TextInput } from './controls'
import type { ActionFormProps } from './types'

const SETTABLE = [
  { value: 'priority', label: 'Priority' },
  { value: 'productInterest', label: 'Product interest' },
  { value: 'budget', label: 'Budget' },
  { value: 'language', label: 'Language' },
  { value: 'location', label: 'Location' },
  { value: 'leadType', label: 'Lead type' },
  { value: 'requirement', label: 'Requirement' },
]

const cap = (value: string) => value.replace(/^\w/, (c) => c.toUpperCase())

export function SetFieldForm({ action, onChange, options, errors }: ActionFormProps<'set_field'>) {
  const fields = [...SETTABLE, ...options.customFields]
  const choices = action.field === 'priority' ? PRIORITIES : action.field === 'leadType' ? LEAD_TYPES : null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <PickOne label="Field" value={action.field} options={fields} error={errors[0]} onChange={(field) => onChange({ ...action, field, value: '' })} />
      {choices ? (
        <PickOne label="New value" value={String(action.value)} options={choices.map((c) => ({ value: c, label: cap(c) }))} onChange={(value) => onChange({ ...action, value })} />
      ) : (
        <TextInput label="New value" value={String(action.value)} onChange={(value) => onChange({ ...action, value })} />
      )}
    </div>
  )
}
