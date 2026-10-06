import { formatChartTick } from './chart-theme'

export interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ name?: string; value?: number | string; color?: string }>
  label?: string | number
}

function display(value: number | string | undefined): string {
  if (typeof value === 'number') return formatChartTick(value)
  return value === undefined ? '' : String(value)
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs shadow-popover">
      {label ? <p className="mb-1 font-medium">{label}</p> : null}
      <ul className="space-y-0.5">
        {payload.map((entry) => (
          <li key={`${entry.name}-${entry.value}`} className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-sm bg-primary" aria-hidden="true" />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto tabular-nums">{display(entry.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
