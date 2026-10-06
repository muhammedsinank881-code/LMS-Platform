import { toDateInputValue } from '@/lib/date-input'
import { Input, type InputProps } from './input'

export interface DatePickerProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  value?: string
  onValueChange?: (value: string) => void
}

/** Styled native date input. `value` is `YYYY-MM-DD` or empty. */
export function DatePicker({ value = '', onValueChange, ...props }: DatePickerProps) {
  return (
    <Input
      {...props}
      type="date"
      value={toDateInputValue(value)}
      onChange={(event) => onValueChange?.(event.target.value)}
    />
  )
}
