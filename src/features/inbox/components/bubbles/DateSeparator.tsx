import { formatDayLabel } from '@/lib/format'

export function DateSeparator({ value }: { value: string }) {
  return (
    <div className="flex justify-center py-3" role="separator" aria-label={formatDayLabel(value)}>
      <span className="rounded-full border border-border bg-surface px-3 py-0.5 text-xs font-medium text-muted-foreground">
        {formatDayLabel(value)}
      </span>
    </div>
  )
}
