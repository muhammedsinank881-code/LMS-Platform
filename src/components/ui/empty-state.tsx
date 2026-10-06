import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center text-foreground',
  {
    variants: {
      size: {
        sm: 'gap-1 px-4 py-8',
        md: 'gap-2 px-6 py-16',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

const iconTones = {
  default: 'bg-muted text-muted-foreground',
  destructive: 'bg-destructive/10 text-destructive',
} as const

export interface EmptyStateProps extends VariantProps<typeof emptyStateVariants> {
  icon?: LucideIcon
  title: string
  description?: ReactNode
  /** Typically a `<Button>`. */
  action?: ReactNode
  /** `destructive` is for error states and announces itself to screen readers. */
  tone?: keyof typeof iconTones
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'default',
  size,
  className,
}: EmptyStateProps) {
  return (
    <div
      role={tone === 'destructive' ? 'alert' : undefined}
      className={cn(emptyStateVariants({ size }), className)}
    >
      {Icon ? (
        <span
          aria-hidden="true"
          className={cn(
            'mb-2 flex items-center justify-center rounded-full',
            size === 'sm' ? 'h-10 w-10' : 'h-12 w-12',
            iconTones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
