import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** One horizontal strip of fields and actions. Narrow screens scroll instead of stacking. */
export function ControlRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-2 overflow-x-auto', className)}>{children}</div>
}

/** Width slot so a full-width input or select stays on the row. */
export function ControlField({
  children,
  className,
  grow = false,
  label,
}: {
  children: ReactNode
  className?: string
  grow?: boolean
  label?: string
}) {
  return (
    <label className={cn('block', grow ? 'min-w-48 flex-1' : 'w-44 shrink-0', className)}>
      {label ? <span className="mb-1 block text-sm font-medium text-foreground">{label}</span> : null}
      {children}
    </label>
  )
}
