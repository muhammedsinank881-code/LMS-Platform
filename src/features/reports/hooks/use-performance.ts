import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { LeaderboardMetric, PerformanceQuery, TargetInput } from '@/types'

function usePerf<T>(name: string, enabled: boolean, load: () => Promise<T>, ...parts: unknown[]) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.performance.view(name, ...parts),
    queryFn: load,
    enabled: ready && enabled,
    placeholderData: keepPreviousData,
  })
}

export const useTeamPerformance = (query: PerformanceQuery, enabled = true) =>
  usePerf('team', enabled, () => api.performance.team(query), query)

export const useRepDetail = (userId: string | undefined, query: PerformanceQuery) =>
  usePerf('rep', Boolean(userId), () => api.performance.repDetail(userId ?? '', query), userId, query)

export const useLeaderboard = (query: PerformanceQuery, metric: LeaderboardMetric, enabled = true) =>
  usePerf('leaderboard', enabled, () => api.performance.leaderboard(query, metric), query, metric)

export const useTargets = (month: string) =>
  usePerf('targets', true, () => api.performance.listTargets(month), month)

export const useTargetProgress = (month: string) =>
  usePerf('progress', true, () => api.performance.targetProgress(month), month)

export function useSaveTarget() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: TargetInput) => api.performance.saveTarget(input),
    onSuccess: () => invalidate('performance', 'auditLogs'),
    meta: { errorTitle: 'Could not save the target' },
  })
}

export function useDeleteTarget() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.performance.deleteTarget(id),
    onSuccess: () => invalidate('performance', 'auditLogs'),
    meta: { errorTitle: 'Could not delete the target' },
  })
}
