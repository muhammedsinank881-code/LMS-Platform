import { keepPreviousData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { ActivityListParams, DuplicateProbe, LeadId, LeadListParams } from '@/types'

/** A page of leads in the caller's data scope. The previous page stays on screen while the next loads. */
export function useLeads(params?: LeadListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.leads.list(params),
    queryFn: () => api.leads.list(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function usePrefetchLead() {
  const client = useQueryClient()
  const { keys, ready } = useWorkspace()
  return useCallback(
    (id: string) => {
      if (!ready) return
      void client.prefetchQuery({
        queryKey: keys.leads.detail(id),
        queryFn: () => api.leads.get(id as LeadId),
        staleTime: 30_000,
      })
    },
    [client, keys, ready],
  )
}

/** Warms the next page while the current page is on screen. */
export function usePrefetchNextLeadPage(params: LeadListParams, total: number | undefined) {
  const client = useQueryClient()
  const { keys, ready } = useWorkspace()
  const serialized = JSON.stringify(params)
  useEffect(() => {
    if (!ready || total === undefined) return
    const current = JSON.parse(serialized) as LeadListParams
    const page = current.page ?? 1
    const pageSize = current.pageSize ?? 20
    if (page * pageSize >= total) return
    const next = { ...current, page: page + 1 }
    void client.prefetchQuery({
      queryKey: keys.leads.list(next),
      queryFn: () => api.leads.list(next),
    })
  }, [client, keys, ready, serialized, total])
}

export function useLead(id: LeadId | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.leads.detail(id ?? ''),
    queryFn: () => api.leads.get(id as LeadId),
    enabled: ready && Boolean(id),
  })
}

export function useLeadActivities(id: LeadId | null | undefined, params?: ActivityListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.leads.activities(id ?? '', params),
    queryFn: () => api.leads.listActivities(id as LeadId, params),
    enabled: ready && Boolean(id),
    placeholderData: keepPreviousData,
  })
}

const TIMELINE_PAGE_SIZE = 20

/** Newest first, one page at a time. `types` narrows the feed; omit it for every event. */
export function useLeadTimeline(id: LeadId | null | undefined, types?: ActivityListParams['types']) {
  const { keys, ready } = useWorkspace()
  const params: ActivityListParams = { pageSize: TIMELINE_PAGE_SIZE, ...(types?.length ? { types } : {}) }
  return useInfiniteQuery({
    queryKey: keys.leads.activities(id ?? '', params),
    queryFn: ({ pageParam }) => api.leads.listActivities(id as LeadId, { ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.pageCount ? last.page + 1 : undefined),
    enabled: ready && Boolean(id),
  })
}

export function usePinnedNotes(id: LeadId | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.leads.pinnedNotes(id ?? ''),
    queryFn: () => api.leads.listPinnedNotes(id as LeadId),
    enabled: ready && Boolean(id),
  })
}

export function useLeadRelations(id: LeadId | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.leads.relations(id ?? ''),
    queryFn: () => api.leads.getRelations(id as LeadId),
    enabled: ready && Boolean(id),
  })
}

export function useDuplicateGroups() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.leads.duplicateGroups,
    queryFn: () => api.leads.listDuplicateGroups(),
    enabled: ready,
  })
}

/** Live check while a lead form is being filled in. Pass `enabled: false` until there is something to compare. */
export function useDuplicateCheck(probe: DuplicateProbe, options?: { excludeId?: LeadId; enabled?: boolean }) {
  const { keys, ready } = useWorkspace()
  const hasContact = Boolean(probe.phone || probe.whatsapp || probe.email)
  return useQuery({
    queryKey: keys.leads.duplicateCheck(probe, options?.excludeId),
    queryFn: () => api.leads.checkDuplicates(probe, options?.excludeId),
    enabled: ready && hasContact && (options?.enabled ?? true),
    staleTime: 0,
  })
}
