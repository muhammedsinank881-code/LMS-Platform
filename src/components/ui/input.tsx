import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { fieldVariants, type FieldSize } from './styles'

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  size?: FieldSize
  /** Marks the field invalid: red border and `aria-invalid`. */
  invalid?: boolean
  /** Decorative node pinned inside the left edge (e.g. a search icon). */
  leftAdornment?: ReactNode
  /** Node pinned inside the right edge (e.g. a clear button or unit label). */
  rightAdornment?: ReactNode
}

function modeFor(type: string): InputProps['inputMode'] {
  if (type === 'tel') return 'tel'
  if (type === 'email') return 'email'
  if (type === 'number') return 'decimal'
  if (type === 'search') return 'search'
  return undefined
}

export function Input({
  className,
  size,
  invalid,
  leftAdornment,
  rightAdornment,
  type = 'text',
  inputMode,
  ...props
}: InputProps) {
  return (
    <div className="relative w-full">
      {leftAdornment ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground [&_svg]:size-4">
          {leftAdornment}
        </span>
      ) : null}
      <input
        type={type}
        inputMode={inputMode ?? modeFor(type)}
        aria-invalid={invalid || undefined}
        className={cn(
          fieldVariants({ size, invalid }),
          leftAdornment && 'pl-9',
          rightAdornment && 'pr-10',
          className,
        )}
        {...props}
      />
      {rightAdornment ? (
        <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground [&_svg]:size-4">
          {rightAdornment}
        </span>
      ) : null}
    </div>
  )
}
