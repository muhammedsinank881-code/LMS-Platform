import { Pencil, Trash2 } from 'lucide-react'
import { SortableList } from '@/components/common/SortableList'
import { Badge, Button, Select } from '@/components/ui'
import type { CustomFieldDefinition, LeadFormField } from '@/types'
import { leadFieldOptions } from '../lib/fields'
import { newField } from '../lib/form-draft'

/** The form's fields: drag to reorder, edit or remove, and add any lead or custom field not already used. */
export function FieldList({
  fields,
  customFields,
  onChange,
  onEdit,
  error,
}: {
  fields: LeadFormField[]
  customFields: CustomFieldDefinition[]
  onChange: (fields: LeadFormField[]) => void
  onEdit: (id: string) => void
  error?: string
}) {
  const used = new Set(fields.map((field) => field.key))
  const available = leadFieldOptions(customFields).filter((option) => !used.has(option.value))

  return (
    <div className="space-y-3">
      <SortableList
        items={fields}
        label="Form fields"
        onReorder={(ids) => onChange(ids.map((id) => fields.find((field) => field.id === id)).filter((field): field is LeadFormField => Boolean(field)))}
        renderItem={(field) => (
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{field.label}</p>
              <p className="truncate text-xs text-muted-foreground">{field.key} · {field.type}</p>
            </div>
            {field.required ? <Badge size="sm">Required</Badge> : null}
            <Button size="icon-sm" variant="ghost" aria-label={`Edit ${field.label}`} onClick={() => onEdit(field.id)}>
              <Pencil />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label={`Remove ${field.label}`} onClick={() => onChange(fields.filter((item) => item.id !== field.id))}>
              <Trash2 />
            </Button>
          </div>
        )}
      />
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <div className="max-w-xs">
        <Select
          aria-label="Add a field"
          placeholder={available.length === 0 ? 'All fields added' : 'Add a field…'}
          disabled={available.length === 0}
          value=""
          onValueChange={(key) => {
            const field = newField(key, customFields)
            onChange([...fields, field])
            onEdit(field.id)
          }}
          options={available}
        />
      </div>
    </div>
  )
}
