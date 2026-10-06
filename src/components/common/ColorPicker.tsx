import { COLOR_PRESETS } from '@/lib/settings/palette'
import { cn } from '@/lib/cn'
import { Input } from '@/components/ui'

export function ColorPicker({
  value,
  onChange,
  label = 'Color',
}: {
  value: string
  onChange: (value: string) => void
  label?: string
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label={label}>
        {COLOR_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            role="option"
            aria-selected={value.toLowerCase() === color}
            aria-label={color}
            className={cn(
              'h-7 w-7 rounded-full border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              value.toLowerCase() === color && 'ring-2 ring-ring ring-offset-2',
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
      <Input
        aria-label="Custom hex color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="#6366f1"
      />
    </div>
  )
}
