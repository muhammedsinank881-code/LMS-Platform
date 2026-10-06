import { Zap } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface BrandMarkProps {
  /** Hide the wordmark and show only the icon (collapsed sidebar). */
  iconOnly?: boolean
  inverted?: boolean
  className?: string
}

export function BrandMark({ iconOnly = false, inverted = false, className }: BrandMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
          inverted ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground',
        )}
      >
        <Zap className="h-4 w-4" />
      </span>
      <span
        className={cn(
          'text-lg font-semibold tracking-tight',
          inverted ? 'text-primary-foreground' : 'text-foreground',
          iconOnly && 'sr-only',
        )}
      >
        LeadFlow
      </span>
    </span>
  )
}
