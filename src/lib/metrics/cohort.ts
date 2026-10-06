import { calendarDayKey } from '@/lib/date-range'
import type { CohortRow } from '@/types'

export const COHORT_WINDOWS = [30, 60, 90] as const
const DAY_MS = 86_400_000

export interface CohortLead {
  createdAt: string
  /** When the lead converted (won). Null if it has not. */
  convertedAt: string | null
}

function monthEnd(month: string): number {
  const [year, mon] = month.split('-').map(Number)
  return Date.UTC(year ?? 1970, mon ?? 1, 1)
}

/**
 * Cohorts by lead creation month: the percentage converted within 30, 60 and 90 days. A window
 * is null until the whole cohort is old enough to have lived through it.
 */
export function buildCohortTable(leads: readonly CohortLead[], now: Date): CohortRow[] {
  const groups = new Map<string, CohortLead[]>()
  for (const lead of leads) {
    const day = calendarDayKey(lead.createdAt)
    if (!day) continue
    const month = day.slice(0, 7)
    groups.set(month, [...(groups.get(month) ?? []), lead])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, items]) => {
      const cell = (days: number): number | null => {
        if (monthEnd(month) + days * DAY_MS > now.getTime()) return null
        const converted = items.filter((lead) => {
          if (!lead.convertedAt) return false
          const gap = Date.parse(lead.convertedAt) - Date.parse(lead.createdAt)
          return gap >= 0 && gap <= days * DAY_MS
        }).length
        return (converted / items.length) * 100
      }
      return { month, leads: items.length, d30: cell(30), d60: cell(60), d90: cell(90) }
    })
}
