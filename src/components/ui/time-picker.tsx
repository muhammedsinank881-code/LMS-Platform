import { Input, type InputProps } from './input'

export interface TimePickerProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  /** `HH:mm`, or empty. */
  value?: string
  onValueChange?: (value: string) => void
}

/** Styled native time input. */
export function TimePicker({ value = '', onValueChange, ...props }: TimePickerProps) {
  return (
    <Input
      {...props}
      type="time"
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    />
  )
}
