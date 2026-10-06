import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'
import { fieldVariants } from './styles'

export interface TextareaProps extends ComponentProps<'textarea'> {
  /** Marks the field invalid: red border and `aria-invalid`. */
  invalid?: boolean
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(fieldVariants({ size: 'multiline', invalid }), 'resize-y', className)}
      {...props}
    />
  )
}
