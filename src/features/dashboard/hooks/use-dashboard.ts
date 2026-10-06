import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { ReportQuery } from '@/types'

function useDashboardQuery<T>(name: string, query: ReportQuery, load: () => Promise<T>) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.reports.view(name, query),
    queryFn: load,
    enabled: ready && Boolean(query.range.from && query.range.to),
    placeholderData: keepPreviousData,
  })
}

export const useDashboardSummary = (query: ReportQuery) =>
  useDashboardQuery('summary', query, () => api.reports.summary(query))

export const useCallList = (query: ReportQuery) =>
  useDashboardQuery('call-list', query, () => api.reports.callList(query))

export const useRecentActivity = (query: ReportQuery) =>
  useDashboardQuery('recent-activity', query, () => api.reports.recentActivity(query))
