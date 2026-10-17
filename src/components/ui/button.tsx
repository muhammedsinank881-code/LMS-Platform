import type { ComponentProps } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { focusRing } from './styles'

const buttonVariants = cva(
  `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 ${focusRing}`,
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-muted text-foreground hover:bg-border',
        outline: 'border border-input bg-surface text-foreground hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs sm:text-sm',
        md: 'h-9 px-3.5 sm:h-10 sm:px-4 text-xs sm:text-sm',
        lg: 'h-11 px-5 sm:h-12 sm:px-6 text-sm sm:text-base',
        'icon-sm': 'h-8 w-8',
        icon: 'h-9 w-9 sm:h-10 sm:w-10',
        'icon-lg': 'h-11 w-11 sm:h-12 sm:w-12',
      },
    },
    compoundVariants: [{ variant: 'link', class: 'h-auto px-0' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /** Render the single child as the button (e.g. a router link) instead of a `<button>`. */
  asChild?: boolean
  /** Shows a spinner, sets `aria-busy` and disables the button. Ignored when `asChild`. */
  loading?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className)

  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
