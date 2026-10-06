import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const skeletonVariants = cva('animate-pulse bg-muted', {
  variants: {
    shape: {
      rect: 'rounded-md',
      text: 'h-4 w-full rounded-sm',
      circle: 'rounded-full',
    },
  },
  defaultVariants: { shape: 'rect' },
})

export interface SkeletonProps
  extends ComponentProps<'div'>, VariantProps<typeof skeletonVariants> {}

/**
 * Size it with className (e.g. `h-10 w-full`, `h-8 w-8` for circles).
 * Purely decorative: wrap the loading region in `aria-busy` / `role="status"` at the call site.
 */
export function Skeleton({ className, shape, ...props }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={cn(skeletonVariants({ shape }), className)} {...props} />
  )
}
