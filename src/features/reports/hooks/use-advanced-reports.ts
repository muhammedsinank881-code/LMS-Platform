import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { Attribution, ReportQuery, SavedReportInput } from '@/types'

function useAdvanced<T>(name: string, query: ReportQuery, load: () => Promise<T>, extra: unknown = null) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.reports.view(name, { ...query, extra } as ReportQuery),
    queryFn: load,
    enabled: ready && Boolean(query.range.from && query.range.to),
    placeholderData: keepPreviousData,
  })
}

export const useCampaignReport = (query: ReportQuery) =>
  useAdvanced('campaign-report', query, () => api.reports.campaignReport(query))

export const useSpendVsRevenue = (query: ReportQuery) =>
  useAdvanced('spend-vs-revenue', query, () => api.reports.spendVsRevenue(query))

export const useAttribution = (query: ReportQuery, mode: Attribution) =>
  useAdvanced('attribution', query, () => api.reports.attribution(query, mode), mode)

export const useSourceRoi = (query: ReportQuery) =>
  useAdvanced('source-roi', query, () => api.reports.sourceRoi(query))

export const useFunnelVelocity = (query: ReportQuery, stuckDays: number) =>
  useAdvanced('funnel-velocity', query, () => api.reports.funnelVelocity(query, stuckDays), stuckDays)

export const useResponseFollowUp = (query: ReportQuery) =>
  useAdvanced('response-follow-up', query, () => api.reports.responseFollowUp(query))

export const useForecast = (query: ReportQuery) =>
  useAdvanced('forecast', query, () => api.reports.forecast(query))

export function useSavedReports() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.reports.view('saved', {} as ReportQuery),
    queryFn: () => api.reports.listSavedReports(),
    enabled: ready,
  })
}

export function useSaveReport() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: SavedReportInput) => api.reports.saveReport(input),
    onSuccess: () => invalidate('reports', 'auditLogs'),
    meta: { errorTitle: 'Could not save the report' },
  })
}

export function useDeleteSavedReport() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.reports.deleteSavedReport(id),
    onSuccess: () => invalidate('reports', 'auditLogs'),
    meta: { errorTitle: 'Could not delete the saved report' },
  })
}
