import type { AuditLog, AuditValue } from '@/types'

function formatValue(value: AuditValue[string]): string {
  if (value === null) return 'empty'
  if (typeof value === 'boolean') return value ? 'yes' : 'no'
  if (Array.isArray(value)) return value.join(', ') || 'empty'
  return String(value)
}

function labelOf(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()
}

/** One line such as "Status: New → Qualified" from the stored before/after maps. */
export function summarizeAuditChange(log: Pick<AuditLog, 'previousValue' | 'newValue' | 'action'>): string {
  const next = log.newValue
  const previous = log.previousValue
  if (!next && !previous) return log.action.replaceAll('_', ' ')
  const keys = [...new Set([...Object.keys(previous ?? {}), ...Object.keys(next ?? {})])]
  if (keys.length === 0) return log.action.replaceAll('_', ' ')
  return keys
    .slice(0, 3)
    .map((key) => {
      const from = formatValue(previous?.[key] ?? null)
      const to = formatValue(next?.[key] ?? null)
      if (!previous) return `${labelOf(key)}: ${to}`
      if (!next) return `${labelOf(key)}: ${from}`
      return `${labelOf(key)}: ${from} → ${to}`
    })
    .join(' · ')
}
