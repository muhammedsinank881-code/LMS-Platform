import { DatePicker, Input, MultiSelect, Select, Switch } from '@/components/ui'
import type { CustomFieldDefinition, CustomFieldValue } from '@/types'

/** The same control the lead drawer, deal drawer, and settings preview render. */
export function DynamicFields({
  fields,
  values,
  onChange,
}: {
  fields: CustomFieldDefinition[]
  values: Record<string, CustomFieldValue>
  onChange: (key: string, value: CustomFieldValue) => void
}) {
  if (fields.length === 0) return null
  return (
    <div className="space-y-3">
      {fields.map((field) => {
        const current = values[field.key] ?? field.defaultValue ?? null
        return (
          <label key={field.id} className="block space-y-1 text-sm">
            <span className="font-medium text-foreground">
              {field.label}
              {field.required ? <span className="text-destructive"> *</span> : null}
            </span>
            {field.helpText ? <span className="block text-muted-foreground">{field.helpText}</span> : null}
            <FieldControl field={field} value={current} onChange={(value) => onChange(field.key, value)} />
          </label>
        )
      })}
    </div>
  )
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: CustomFieldDefinition
  value: CustomFieldValue
  onChange: (value: CustomFieldValue) => void
}) {
  const options = field.options.map((option) => ({ value: option, label: option }))
  if (field.type === 'boolean') {
    return <Switch checked={value === true} onCheckedChange={onChange} aria-label={field.label} />
  }
  if (field.type === 'dropdown') {
    return (
      <Select
        aria-label={field.label}
        options={options}
        value={typeof value === 'string' ? value : undefined}
        onValueChange={onChange}
      />
    )
  }
  if (field.type === 'multiselect') {
    return (
      <MultiSelect
        aria-label={field.label}
        options={options}
        value={Array.isArray(value) ? value : []}
        onValueChange={onChange}
      />
    )
  }
  if (field.type === 'date') {
    return <DatePicker aria-label={field.label} value={typeof value === 'string' ? value : ''} onValueChange={onChange} />
  }
  if (field.type === 'file') return <Input disabled placeholder="File upload is not available yet" aria-label={field.label} />
  return (
    <Input
      aria-label={field.label}
      type={field.type === 'number' || field.type === 'currency' ? 'number' : field.type === 'url' ? 'url' : 'text'}
      value={value === null || value === undefined ? '' : String(value)}
      onChange={(event) =>
        onChange(field.type === 'number' || field.type === 'currency' ? (event.target.value === '' ? null : Number(event.target.value)) : event.target.value)
      }
    />
  )
}
