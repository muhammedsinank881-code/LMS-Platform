export const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--info))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--score-hot))',
  'hsl(var(--score-warm))',
  'hsl(var(--score-cold))',
  'hsl(var(--muted-foreground))',
] as const

export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length] ?? CHART_COLORS[0]
}

function trim(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

/** Short axis and tooltip labels: 1,200 → 1.2k, 12,00,000 → 12L. */
export function formatChartTick(value: number): string {
  if (!Number.isFinite(value)) return ''
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 10_000_000) return `${sign}${trim(abs / 10_000_000)}Cr`
  if (abs >= 100_000) return `${sign}${trim(abs / 100_000)}L`
  if (abs >= 1_000) return `${sign}${trim(abs / 1_000)}k`
  return `${sign}${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(abs)}`
}
