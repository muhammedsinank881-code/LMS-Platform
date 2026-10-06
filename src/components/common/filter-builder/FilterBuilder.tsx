import { Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import { FilterRow } from './FilterRow'
import { defaultOperator, type FilterDraft, type FilterFieldConfig } from './operators'

export interface FilterBuilderProps<F extends string> {
  fields: FilterFieldConfig<F>[]
  value: FilterDraft<F>[]
  onChange: (next: FilterDraft<F>[]) => void
  onApply: () => void
  onClear: () => void
}

export function FilterBuilder<F extends string>({
  fields,
  value,
  onChange,
  onApply,
  onClear,
}: FilterBuilderProps<F>) {
  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">No filters yet. Add a condition.</p>
      ) : (
        <div className="space-y-2">
          {value.map((row, index) => (
            <FilterRow
              key={`${row.field}-${index}`}
              fields={fields}
              row={row}
              onChange={(updated) =>
                onChange(value.map((item, i) => (i === index ? updated : item)))
              }
              onRemove={() => onChange(value.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const first = fields[0]
            if (!first) return
            onChange([...value, { field: first.id, operator: defaultOperator(first.type) }])
          }}
        >
          <Plus />
          Add condition
        </Button>
        <span className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
          <Button size="sm" onClick={onApply}>
            Apply
          </Button>
        </span>
      </div>
    </div>
  )
}
