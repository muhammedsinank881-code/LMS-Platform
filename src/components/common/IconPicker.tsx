import { ICON_OPTIONS } from '@/lib/settings/palette'
import { cn } from '@/lib/cn'

export function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-6 gap-1" role="listbox" aria-label="Icon">
      {ICON_OPTIONS.map((option) => {
        const Icon = option.icon
        const selected = option.name === value
        return (
          <button
            key={option.name}
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={option.name}
            className={cn(
              'flex h-9 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected && 'border-border bg-muted text-foreground',
            )}
            onClick={() => onChange(option.name)}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
