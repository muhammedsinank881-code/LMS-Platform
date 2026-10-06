import type { ComponentProps } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { focusRing } from './styles'

const switchVariants = cva(
  `peer inline-flex shrink-0 items-center rounded-full border-2 border-transparent bg-muted-foreground/40 transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary ${focusRing}`,
  {
    variants: {
      size: { sm: 'h-5 w-9', md: 'h-6 w-11' },
    },
    defaultVariants: { size: 'md' },
  },
)

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-surface transition-transform data-[state=unchecked]:translate-x-0',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4',
        md: 'h-5 w-5 data-[state=checked]:translate-x-5',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export interface SwitchProps
  extends ComponentProps<typeof SwitchPrimitive.Root>, VariantProps<typeof switchVariants> {}

/** Pair with `<Label htmlFor>` or give it an `aria-label`. */
export function Switch({ className, size, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root className={cn(switchVariants({ size }), className)} {...props}>
      <SwitchPrimitive.Thumb className={thumbVariants({ size })} />
    </SwitchPrimitive.Root>
  )
}
