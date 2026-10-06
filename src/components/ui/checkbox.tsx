import type { ComponentProps } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { focusRing } from './styles'

const checkboxVariants = cva(
  `peer shrink-0 rounded-sm border border-muted-foreground/50 bg-surface text-primary-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary ${focusRing}`,
  {
    variants: {
      size: { sm: 'h-4 w-4', md: 'h-5 w-5' },
    },
    defaultVariants: { size: 'md' },
  },
)

export interface CheckboxProps
  extends ComponentProps<typeof CheckboxPrimitive.Root>, VariantProps<typeof checkboxVariants> {}

/** Pair with `<Label htmlFor>` or give it an `aria-label`. `checked` accepts `'indeterminate'`. */
export function Checkbox({ className, size, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root className={cn(checkboxVariants({ size }), className)} {...props}>
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        {props.checked === 'indeterminate' ? (
          <Minus className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
        ) : (
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
