import { X } from 'lucide-react'
import { Button } from '@/components/ui'
import type { FilterCondition } from '@/types'
import {
  DATE_PRESET_OPTIONS,
  operatorLabel,
  type FilterFieldConfig,
} from './filter-builder/operators'

export interface FilterChipsProps<F extends string> {
  fields: FilterFieldConfig<F>[]
  filters: FilterCondition<F>[]
  onRemove: (index: number) => void
  onClear?: () => void
}

function formatValue<F extends string>(
  field: FilterFieldConfig<F> | undefined,
  condition: FilterCondition<F>,
): string {
  if (!('value' in condition)) return ''
  const { value } = condition
  if (condition.operator === 'date_preset') {
    return DATE_PRESET_OPTIONS.find((item) => item.value === value)?.label ?? String(value)
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => field?.options?.find((option) => option.value === String(item))?.label ?? String(item))
      .join(', ')
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return field?.options?.find((option) => option.value === String(value))?.label ?? String(value)
}

export function FilterChips<F extends string>({
  fields,
  filters,
  onRemove,
  onClear,
}: FilterChipsProps<F>) {
  if (filters.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter, index) => {
        const field = fields.find((item) => item.id === filter.field)
        const value = formatValue(field, filter)
        return (
          <span
            key={`${filter.field}-${index}`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted py-0.5 pl-2.5 pr-1 text-xs text-foreground"
          >
            <span>
              {field?.label ?? filter.field} {operatorLabel(filter.operator)}
              {value ? ` ${value}` : ''}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-5 w-5"
              aria-label={`Remove ${field?.label ?? filter.field} filter`}
              onClick={() => onRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </span>
        )
      })}
      {onClear ? (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </div>
  )
}
