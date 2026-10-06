import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { fieldVariants, menuItem, popoverSurface, type FieldSize } from './styles'

export interface SelectOption {
  /** Must be a non-empty string (Radix reserves '' for "no selection"). */
  value: string
  label: string
  disabled?: boolean
}

export interface SelectGroupOption {
  label: string
  options: SelectOption[]
}

export type SelectItemData = SelectOption | SelectGroupOption

function isGroup(item: SelectItemData): item is SelectGroupOption {
  return 'options' in item
}

export interface SelectProps {
  options: SelectItemData[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  size?: FieldSize
  invalid?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

function OptionItem({ option }: { option: SelectOption }) {
  return (
    <SelectPrimitive.Item
      value={option.value}
      disabled={option.disabled}
      className={cn(menuItem, 'pr-8')}
    >
      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center">
        <Check aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select…',
  size,
  invalid,
  disabled,
  required,
  name,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      required={required}
      name={name}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={invalid || undefined}
        className={cn(
          fieldVariants({ size, invalid }),
          'inline-flex items-center justify-between gap-2 text-left data-[placeholder]:text-muted-foreground',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} className="truncate" />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className={cn(
            popoverSurface,
            'max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden',
          )}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((item) =>
              isGroup(item) ? (
                <SelectPrimitive.Group key={item.label}>
                  <SelectPrimitive.Label className="px-2 py-2 text-xs font-medium text-muted-foreground">
                    {item.label}
                  </SelectPrimitive.Label>
                  {item.options.map((option) => (
                    <OptionItem key={option.value} option={option} />
                  ))}
                </SelectPrimitive.Group>
              ) : (
                <OptionItem key={item.value} option={item} />
              ),
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
