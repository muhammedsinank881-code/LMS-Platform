import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { FollowUpListParams } from '@/types'

export function useFollowUps(params?: FollowUpListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.followUps.list(params),
    queryFn: () => api.followUps.list(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useFollowUp(id: string | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.followUps.detail(id ?? ''),
    queryFn: () => api.followUps.get(id ?? ''),
    enabled: ready && Boolean(id),
  })
}

/** Overdue / today / tomorrow / upcoming counts for the tabs above the list. */
export function useFollowUpBuckets(params?: FollowUpListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.followUps.buckets(params),
    queryFn: () => api.followUps.getBuckets(params),
    enabled: ready,
  })
}
