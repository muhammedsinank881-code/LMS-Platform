import { useAuthStore } from '@/store/auth-store'
import type { FollowUpBuckets, FollowUpListParams } from '@/types'
import { useFollowUpBuckets } from './use-followups'

export interface FollowUpSummary extends FollowUpBuckets {
  dueNow: number
  isLoading: boolean
  isError: boolean
}

/** Bucket counts for dashboards and the sidebar badge. `mine` limits the count to the current user. */
export function useFollowUpSummary(scope: 'mine' | 'team' = 'team'): FollowUpSummary {
  const userId = useAuthStore((state) => state.user?.id)
  const params: FollowUpListParams | undefined =
    scope === 'mine' && userId
      ? { filters: [{ field: 'assigneeId', operator: 'equals', value: userId }] }
      : undefined
  const buckets = useFollowUpBuckets(params)
  const data = buckets.data ?? { overdue: 0, today: 0, tomorrow: 0, upcoming: 0 }
  return {
    ...data,
    dueNow: data.overdue + data.today,
    isLoading: buckets.isLoading,
    isError: buckets.isError,
  }
}
