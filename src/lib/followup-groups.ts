import type { FollowUp, FollowUpBucket } from '@/types'
import { FOLLOWUP_BUCKETS } from '@/types'
import { bucketFollowUps, bucketOf } from './followup-buckets'

export type FollowUpGroups = Record<FollowUpBucket, FollowUp[]>

export function emptyFollowUpGroups(): FollowUpGroups {
  return { overdue: [], today: [], tomorrow: [], upcoming: [] }
}

/** Open follow-ups grouped and sorted by due time. Completed rows are left out. */
export function groupFollowUps(items: readonly FollowUp[], now: Date): FollowUpGroups {
  const groups = emptyFollowUpGroups()
  for (const item of items) {
    if (item.status === 'done') continue
    groups[bucketOf(item.dueAt, now)].push(item)
  }
  for (const bucket of FOLLOWUP_BUCKETS) {
    groups[bucket].sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  }
  return groups
}

export function groupsMatchBucketCounts(items: readonly FollowUp[], now: Date): boolean {
  const groups = groupFollowUps(items, now)
  const counts = bucketFollowUps(items, now)
  return FOLLOWUP_BUCKETS.every((bucket) => groups[bucket].length === counts[bucket])
}
