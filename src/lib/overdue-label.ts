import { differenceInCalendarDays, formatDistanceStrict } from 'date-fns'

/** "overdue by 2d" once a full calendar day has passed, otherwise a short distance. */
export function overdueLabel(dueAt: string | null, now: Date): string | null {
  if (!dueAt) return null
  const due = new Date(dueAt)
  if (Number.isNaN(due.getTime()) || due.getTime() >= now.getTime()) return null
  const days = differenceInCalendarDays(now, due)
  if (days >= 1) return `overdue by ${days}d`
  return `overdue by ${formatDistanceStrict(due, now)}`
}
