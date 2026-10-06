import { useId, useState } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Command } from 'cmdk'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { SelectOption } from './select'
import { fieldVariants, menuItem, popoverSurface, type FieldSize } from './styles'

const minHeights: Record<FieldSize, string> = {
  sm: 'min-h-8',
  md: 'min-h-10 max-sm:min-h-11',
  lg: 'min-h-12',
}

export interface MultiSelectProps {
  options: SelectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  size?: FieldSize
  invalid?: boolean
  disabled?: boolean
  /** Chips shown before collapsing the rest into "+N". */
  maxVisible?: number
  /** Show a clear-all button when something is selected. */
  clearable?: boolean
  id?: string
  className?: string
  'aria-label'?: string
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No results found',
  size = 'md',
  invalid,
  disabled,
  maxVisible = 3,
  clearable = true,
  id,
  className,
  'aria-label': ariaLabel,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const listId = useId()
  const selected = options.filter((option) => value.includes(option.value))
  const visible = selected.slice(0, maxVisible)
  const hiddenCount = selected.length - visible.length

  const toggle = (optionValue: string) => {
    onValueChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    )
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div
          className={cn(
            fieldVariants({ size, invalid }),
            'flex h-auto flex-wrap items-center gap-1 py-1 max-sm:h-auto',
            minHeights[size],
            'focus-within:border-ring focus-within:ring-2 focus-within:ring-ring',
            invalid && 'focus-within:border-destructive focus-within:ring-destructive',
            disabled && 'pointer-events-none cursor-not-allowed bg-muted opacity-60',
            className,
          )}
        >
          {visible.map((option) => (
            <span
              key={option.value}
              className="inline-flex h-6 items-center gap-1 rounded-sm bg-muted pl-2 pr-1 text-xs font-medium text-foreground"
            >
              {option.label}
              <button
                type="button"
                aria-label={`Remove ${option.label}`}
                disabled={disabled}
                onClick={() => toggle(option.value)}
                className="rounded-sm p-0.5 text-muted-foreground hover:bg-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          {hiddenCount > 0 ? (
            <span className="inline-flex h-6 items-center rounded-sm bg-muted px-2 text-xs font-medium text-foreground">
              +{hiddenCount}
            </span>
          ) : null}
          <PopoverPrimitive.Trigger asChild>
            <button
              type="button"
              id={id}
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listId}
              aria-label={ariaLabel}
              disabled={disabled}
              className="flex min-h-6 min-w-16 flex-1 items-center justify-between gap-2 self-stretch text-left text-sm text-muted-foreground focus-visible:outline-none"
            >
              <span className="truncate">{selected.length === 0 ? placeholder : ''}</span>
              <ChevronDown className="ml-auto h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </PopoverPrimitive.Trigger>
          {clearable && !disabled && selected.length > 0 ? (
            <button
              type="button"
              aria-label="Clear selection"
              onClick={() => onValueChange([])}
              className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(popoverSurface, 'w-72 max-w-[calc(100vw-2rem)] p-0')}
        >
          <Command loop>
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Command.Input
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.List id={listId} className="max-h-64 overflow-y-auto p-1">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </Command.Empty>
              {options.map((option) => {
                const isSelected = value.includes(option.value)
                return (
                  <Command.Item
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    disabled={option.disabled}
                    onSelect={() => toggle(option.value)}
                    className={cn(menuItem, 'cursor-pointer')}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/50 bg-surface',
                      )}
                    >
                      {isSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                    <span className="truncate">{option.label}</span>
                    {isSelected ? <span className="sr-only">(selected)</span> : null}
                  </Command.Item>
                )
              })}
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
