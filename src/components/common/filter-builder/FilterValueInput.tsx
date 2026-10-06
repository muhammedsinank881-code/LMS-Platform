import { DatePicker, Input, MultiSelect, Select } from '@/components/ui'
import { useCurrencySymbol } from '@/hooks/use-currency-symbol'
import type { FilterOperator } from '@/types'
import { DATE_PRESET_OPTIONS, type FilterFieldConfig } from './operators'

export interface FilterValueInputProps<F extends string> {
  field: FilterFieldConfig<F>
  operator: FilterOperator
  value: unknown
  onChange: (value: unknown) => void
}

export function FilterValueInput<F extends string>({
  field,
  operator,
  value,
  onChange,
}: FilterValueInputProps<F>) {
  const currency = useCurrencySymbol()
  if (operator === 'is_empty' || operator === 'is_not_empty') return null

  if (operator === 'date_preset') {
    return (
      <Select
        size="sm"
        aria-label="Date preset"
        options={DATE_PRESET_OPTIONS}
        value={typeof value === 'string' ? value : undefined}
        onValueChange={onChange}
        placeholder="Choose a range"
      />
    )
  }

  if (operator === 'between') {
    const pair = Array.isArray(value) ? value : ['', '']
    const update = (index: 0 | 1, next: string | number) => {
      const copy: [unknown, unknown] = [pair[0] ?? '', pair[1] ?? '']
      copy[index] = next
      onChange(copy)
    }
    if (field.type === 'date') {
      return (
        <div className="flex items-center gap-2">
          <DatePicker size="sm" value={String(pair[0] ?? '')} onValueChange={(v) => update(0, v)} />
          <DatePicker size="sm" value={String(pair[1] ?? '')} onValueChange={(v) => update(1, v)} />
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <Input
          size="sm"
          type="number"
          value={pair[0] === undefined || pair[0] === '' ? '' : String(pair[0])}
          onChange={(event) => update(0, event.target.value)}
          aria-label="From"
        />
        <Input
          size="sm"
          type="number"
          value={pair[1] === undefined || pair[1] === '' ? '' : String(pair[1])}
          onChange={(event) => update(1, event.target.value)}
          aria-label="To"
        />
      </div>
    )
  }

  if (operator === 'in' || field.type === 'multi-select') {
    return (
      <MultiSelect
        size="sm"
        aria-label={field.label}
        options={field.options ?? []}
        value={Array.isArray(value) ? value.map(String) : []}
        onValueChange={onChange}
      />
    )
  }

  if (field.type === 'select' || field.type === 'user' || field.type === 'boolean') {
    const options =
      field.type === 'boolean'
        ? [
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]
        : (field.options ?? [])
    return (
      <Select
        size="sm"
        aria-label={field.label}
        options={options}
        value={value === undefined || value === null ? undefined : String(value)}
        onValueChange={(next) =>
          field.type === 'boolean' ? onChange(next === 'true') : onChange(next)
        }
        placeholder="Choose…"
      />
    )
  }

  if (field.type === 'date') {
    return (
      <DatePicker
        size="sm"
        value={typeof value === 'string' ? value : ''}
        onValueChange={onChange}
      />
    )
  }

  if (field.type === 'number' || field.type === 'currency') {
    return (
      <Input
        size="sm"
        type="number"
        min={0}
        leftAdornment={field.type === 'currency' ? currency : undefined}
        value={value === undefined || value === null ? '' : String(value)}
        onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
        aria-label={field.label}
      />
    )
  }

  return (
    <Input
      size="sm"
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      aria-label={field.label}
    />
  )
}
