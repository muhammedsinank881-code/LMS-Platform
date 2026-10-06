import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const trackVariants = cva('relative w-full overflow-hidden rounded-full bg-muted', {
  variants: {
    size: { sm: 'h-1', md: 'h-2', lg: 'h-3' },
  },
  defaultVariants: { size: 'md' },
})

const indicatorTones = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
} as const

export interface ProgressBarProps extends VariantProps<typeof trackVariants> {
  /** 0..max. Pass `null` for an indeterminate (pulsing) bar. */
  value: number | null
  max?: number
  tone?: keyof typeof indicatorTones
  /** Visible label; also used as the accessible name. */
  label?: string
  /** Show the percentage on the right. */
  showValue?: boolean
  'aria-label'?: string
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  size,
  tone = 'primary',
  label,
  showValue = false,
  className,
  'aria-label': ariaLabel,
}: ProgressBarProps) {
  const percent =
    value === null ? null : Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-foreground">{label}</span>
          {showValue && percent !== null ? (
            <span className="tabular-nums text-muted-foreground">{percent}%</span>
          ) : null}
        </div>
      ) : null}
      <ProgressPrimitive.Root
        value={value}
        max={max}
        aria-label={label ?? ariaLabel}
        className={trackVariants({ size })}
      >
        {/* Data-driven width is the one place an inline style is unavoidable. */}
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full rounded-full transition-[width]',
            indicatorTones[tone],
            percent === null && 'w-full animate-pulse',
          )}
          style={percent === null ? undefined : { width: `${percent}%` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}
