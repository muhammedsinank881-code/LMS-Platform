import { addDays, isSameDay } from 'date-fns'
import type { FollowUp, FollowUpBucket, FollowUpBuckets } from '@/types'

/**
 * Which bucket a due time falls into, relative to `now`:
 * overdue (already past), today (still to come today), tomorrow, or upcoming (later).
 */
export function bucketOf(dueAt: Date | string, now: Date): FollowUpBucket {
  const due = typeof dueAt === 'string' ? new Date(dueAt) : dueAt
  if (due.getTime() < now.getTime()) return 'overdue'
  if (isSameDay(due, now)) return 'today'
  if (isSameDay(due, addDays(now, 1))) return 'tomorrow'
  return 'upcoming'
}

export function emptyBuckets(): FollowUpBuckets {
  return { overdue: 0, today: 0, tomorrow: 0, upcoming: 0 }
}

/** Counts open follow-ups per bucket. Completed ones are ignored. */
export function bucketFollowUps(
  followUps: ReadonlyArray<Pick<FollowUp, 'dueAt' | 'status'>>,
  now: Date,
): FollowUpBuckets {
  const counts = emptyBuckets()
  for (const followUp of followUps) {
    if (followUp.status === 'done') continue
    counts[bucketOf(followUp.dueAt, now)] += 1
  }
  return counts
}
