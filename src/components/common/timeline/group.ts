import { formatDate } from '@/lib/format'
import type { Activity } from '@/types'

export interface ActivityDayGroup {
  key: string
  label: string
  items: Activity[]
}

/** Groups a newest-first list into calendar days, preserving that order. */
export function groupActivitiesByDay(items: readonly Activity[]): ActivityDayGroup[] {
  const groups: ActivityDayGroup[] = []
  for (const item of items) {
    const date = new Date(item.createdAt)
    const key = Number.isNaN(date.getTime()) ? 'unknown' : date.toDateString()
    const label = key === 'unknown' ? 'Unknown date' : formatDate(item.createdAt)
    const current = groups[groups.length - 1]
    if (current?.key === key) current.items.push(item)
    else groups.push({ key, label, items: [item] })
  }
  return groups
}
