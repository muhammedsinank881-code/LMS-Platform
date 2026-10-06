import { Trash2 } from 'lucide-react'
import { Button, Select } from '@/components/ui'
import type { FilterOperator } from '@/types'
import { FilterValueInput } from './FilterValueInput'
import {
  defaultOperator,
  operatorsFor,
  type FilterDraft,
  type FilterFieldConfig,
} from './operators'

export interface FilterRowProps<F extends string> {
  fields: FilterFieldConfig<F>[]
  row: FilterDraft<F>
  onChange: (row: FilterDraft<F>) => void
  onRemove: () => void
}

export function FilterRow<F extends string>({ fields, row, onChange, onRemove }: FilterRowProps<F>) {
  const field = fields.find((item) => item.id === row.field) ?? fields[0]
  const operators = operatorsFor(field.type)

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_minmax(0,1.4fr)_auto]">
      <Select
        size="sm"
        aria-label="Field"
        options={fields.map((item) => ({ value: item.id, label: item.label }))}
        value={row.field}
        onValueChange={(id) => {
          const next = fields.find((item) => item.id === id) ?? field
          onChange({ field: next.id, operator: defaultOperator(next.type) })
        }}
      />
      <Select
        size="sm"
        aria-label="Operator"
        options={operators}
        value={row.operator}
        onValueChange={(operator) =>
          onChange({ ...row, operator: operator as FilterOperator, value: undefined })
        }
      />
      <FilterValueInput
        field={field}
        operator={row.operator}
        value={row.value}
        onChange={(value) => onChange({ ...row, value })}
      />
      <Button variant="ghost" size="icon-sm" aria-label="Remove condition" onClick={onRemove}>
        <Trash2 />
      </Button>
    </div>
  )
}
