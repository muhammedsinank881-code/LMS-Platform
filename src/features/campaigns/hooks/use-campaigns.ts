import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { CampaignBulkAction, CampaignInput } from '@/services/api/campaigns'
import type { CampaignListParams, CampaignMetricsQuery } from '@/types'

/** Campaigns come with their computed metrics for the range. Spend figures are null without view-spend. */
export function useCampaigns(params?: CampaignListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.campaigns.list(params),
    queryFn: () => api.campaigns.list(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useCampaignSummary(params?: CampaignListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.campaigns.view('all', 'summary', params ?? {}),
    queryFn: () => api.campaigns.getSummary(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useCampaign(id: string | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.campaigns.detail(id ?? ''),
    queryFn: () => api.campaigns.get(id ?? ''),
    enabled: ready && Boolean(id),
  })
}

function useCampaignView<T>(
  name: string,
  id: string | undefined,
  query: CampaignMetricsQuery,
  load: (id: string) => Promise<T>,
) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.campaigns.view(id ?? '', name, query),
    queryFn: () => load(id ?? ''),
    enabled: ready && Boolean(id),
    placeholderData: keepPreviousData,
  })
}

export const useCampaignDetail = (id: string | undefined, query: CampaignMetricsQuery) =>
  useCampaignView('detail', id, query, (value) => api.campaigns.getDetail(value, query))

/** Spend, Leads, Qualified, Deals, Revenue with step conversion percentages. */
export const useCampaignFunnel = (id: string | undefined, query: CampaignMetricsQuery) =>
  useCampaignView('funnel', id, query, (value) => api.campaigns.getFunnel(value, query))

export const useCampaignTimeSeries = (id: string | undefined, query: CampaignMetricsQuery) =>
  useCampaignView('series', id, query, (value) => api.campaigns.getTimeSeries(value, query))

export const useCampaignBreakdown = (id: string | undefined, query: CampaignMetricsQuery) =>
  useCampaignView('breakdown', id, query, (value) => api.campaigns.getBreakdown(value, query))

export function useCampaignActivity(id: string | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.campaigns.view(id ?? '', 'activity', {}),
    queryFn: () => api.campaigns.listActivity(id ?? ''),
    enabled: ready && Boolean(id),
  })
}

export function useCreateCampaign() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: CampaignInput) => api.campaigns.create(input),
    onSuccess: () => invalidate('campaigns', 'auditLogs'),
    meta: { errorTitle: 'Could not create campaign' },
  })
}

export function useUpdateCampaign() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CampaignInput> }) =>
      api.campaigns.update(id, patch),
    onSuccess: () => invalidate('campaigns', 'auditLogs'),
    meta: { errorTitle: 'Could not save campaign' },
  })
}

export function useDeleteCampaign() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.campaigns.delete(id),
    onSuccess: () => invalidate('campaigns', 'leads', 'spend', 'adSets', 'auditLogs'),
    meta: { errorTitle: 'Could not delete campaign' },
  })
}

export function useBulkCampaignAction() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: CampaignBulkAction }) =>
      api.campaigns.bulkAction(ids, action),
    onSuccess: () => invalidate('campaigns', 'auditLogs'),
    meta: { errorTitle: 'Could not update the campaigns' },
  })
}
