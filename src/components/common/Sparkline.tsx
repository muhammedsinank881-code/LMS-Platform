import { cn } from '@/lib/cn'

/** Tiny trend line. `label` is the text alternative, e.g. "Leads over the last 14 days: 1 to 6". */
export function Sparkline({
  values,
  label,
  className,
}: {
  values: readonly number[]
  label: string
  className?: string
}) {
  if (values.length < 2) return <span className="text-muted-foreground">—</span>
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = max - min || 1
  const width = 80
  const height = 24
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - ((value - min) / span) * (height - 3) - 1.5
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className={cn('h-6 w-20 text-primary', className)}>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" points={points} />
    </svg>
  )
}
