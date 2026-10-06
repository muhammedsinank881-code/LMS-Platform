import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { BreakdownDimension, ReportExportRequest, ReportQuery } from '@/types'

function useReport<T>(name: string, query: ReportQuery, load: () => Promise<T>) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.reports.view(name, query),
    queryFn: load,
    enabled: ready && Boolean(query.range.from && query.range.to),
    placeholderData: keepPreviousData,
  })
}

export const useLeadsOverTime = (query: ReportQuery) =>
  useReport('leads-over-time', query, () => api.reports.leadsOverTime(query))

export const useBreakdown = (query: ReportQuery, dimension: BreakdownDimension) =>
  useReport(`breakdown-${dimension}`, query, () => api.reports.breakdown(query, dimension))

export const useFunnel = (query: ReportQuery) => useReport('funnel', query, () => api.reports.funnel(query))

export const useRevenueOverTime = (query: ReportQuery) =>
  useReport('revenue-over-time', query, () => api.reports.revenueOverTime(query))

export const usePipelineReport = (query: ReportQuery) =>
  useReport('pipeline', query, () => api.reports.pipeline(query))

export const useWinLoss = (query: ReportQuery) => useReport('win-loss', query, () => api.reports.winLoss(query))

export const useLostAnalysis = (query: ReportQuery) =>
  useReport('lost-analysis', query, () => api.reports.lostAnalysis(query))

export const useSalesPerformance = (query: ReportQuery) =>
  useReport('sales-performance', query, () => api.reports.salesPerformance(query))

export const useFollowUpMetrics = (query: ReportQuery) =>
  useReport('follow-up-metrics', query, () => api.reports.followUpMetrics(query))

export function useExportReport() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  return useMutation({
    mutationFn: (request: ReportExportRequest) => api.reports.export(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.auditLogs.all }),
    meta: { errorTitle: 'Could not export the report' },
  })
}
