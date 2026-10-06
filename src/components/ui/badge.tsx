import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

/**
 * Soft badges keep text in `foreground` (AA on every tint) and carry the semantic color on the dot.
 * Semantic tones are reserved for status, priority and score (hot / warm / cold).
 */
const tones = {
  neutral: {
    soft: 'bg-muted text-foreground',
    solid: 'bg-foreground text-surface',
    dot: 'bg-muted-foreground',
  },
  primary: {
    soft: 'bg-primary/10 text-foreground',
    solid: 'bg-primary text-primary-foreground',
    dot: 'bg-primary',
  },
  success: {
    soft: 'bg-success/10 text-foreground',
    solid: 'bg-success text-success-foreground',
    dot: 'bg-success',
  },
  warning: {
    soft: 'bg-warning/15 text-foreground',
    solid: 'bg-warning text-warning-foreground',
    dot: 'bg-warning',
  },
  destructive: {
    soft: 'bg-destructive/10 text-foreground',
    solid: 'bg-destructive text-destructive-foreground',
    dot: 'bg-destructive',
  },
  info: {
    soft: 'bg-info/10 text-foreground',
    solid: 'bg-info text-info-foreground',
    dot: 'bg-info',
  },
  hot: {
    soft: 'bg-score-hot/10 text-foreground',
    solid: 'bg-score-hot text-surface',
    dot: 'bg-score-hot',
  },
  warm: {
    soft: 'bg-score-warm/15 text-foreground',
    solid: 'bg-score-warm text-warning-foreground',
    dot: 'bg-score-warm',
  },
  cold: {
    soft: 'bg-score-cold/10 text-foreground',
    solid: 'bg-score-cold text-surface',
    dot: 'bg-score-cold',
  },
} as const

export type BadgeTone = keyof typeof tones

const badgeVariants = cva(
  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-medium',
  {
    variants: {
      size: {
        sm: 'h-5 px-2 text-xs',
        md: 'h-6 px-2.5 text-xs',
        lg: 'h-8 px-3 text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export interface BadgeProps
  extends Omit<ComponentProps<'span'>, 'color'>, VariantProps<typeof badgeVariants> {
  tone?: BadgeTone
  appearance?: 'soft' | 'solid'
  /** Leading colored dot. */
  dot?: boolean
}

export function Badge({
  className,
  tone = 'neutral',
  appearance = 'soft',
  size,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const palette = tones[tone]
  return (
    <span className={cn(badgeVariants({ size }), palette[appearance], className)} {...props}>
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            appearance === 'solid' ? 'bg-current' : palette.dot,
          )}
        />
      ) : null}
      {children}
    </span>
  )
}
