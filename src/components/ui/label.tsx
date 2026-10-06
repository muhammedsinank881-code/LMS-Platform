import type { ComponentProps } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/cn'

export interface LabelProps extends ComponentProps<typeof LabelPrimitive.Root> {
  /** Shows a required mark. The word “required” is in the accessible name, and the control gets `aria-required`. */
  required?: boolean
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <>
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> required</span>
        </>
      ) : null}
    </LabelPrimitive.Root>
  )
}
