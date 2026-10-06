import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button, ProgressBar } from '@/components/ui'
import { cn } from '@/lib/cn'

export interface BulkActionBarProps {
  count: number
  label?: string
  onClear: () => void
  children: ReactNode
  busy?: boolean
  className?: string
}

export function BulkActionBar({
  count,
  label,
  onClear,
  children,
  busy = false,
  className,
}: BulkActionBarProps) {
  if (count <= 0) return null
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      aria-busy={busy || undefined}
      className={cn(
        'sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 shadow-popover lg:bottom-4',
        className,
      )}
    >
      {busy ? <ProgressBar value={null} size="sm" aria-label="Working" /> : null}
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto text-sm font-medium text-foreground">
          {label ?? `${count} selected`}
        </p>
        <div className="flex flex-wrap items-center gap-2">{children}</div>
        <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={onClear}>
          <X />
        </Button>
      </div>
    </div>
  )
}
