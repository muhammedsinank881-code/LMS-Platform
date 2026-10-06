import { cn } from '@/lib/cn'

export interface StatusBadgeProps {
  name: string
  color: string
  className?: string
}

/** Status color is workspace data (a hex), so the dot uses a style attribute. */
export function StatusBadge({ name, color, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full bg-muted px-2.5 text-xs font-medium text-foreground',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  )
}
