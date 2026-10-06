import { formatINR, formatINRCompact } from '@/lib/format'

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

export function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—'
  return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value)}%`
}

export function formatMinutes(value: number | null): string {
  if (value === null) return '—'
  if (value < 60) return `${Math.round(value)} min`
  const hours = Math.floor(value / 60)
  return `${hours}h ${Math.round(value % 60)}m`
}

export function moneyPair(value: number): { compact: string; full: string } {
  return { compact: formatINRCompact(value), full: formatINR(value) }
}
