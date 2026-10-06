import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { ScoringSettings } from '@/services/api/settings'
import type { ScoringThresholds } from '@/types'

const scoring = () => api.settings.scoringRules

export function useScoringSettings() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.scoring.settings,
    queryFn: () => scoring().getSettings(),
    enabled: ready,
  })
}

/** Thresholds and decay are saved together. Lead categories derive from them, so lead data goes stale. */
export function useUpdateScoringSettings() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (patch: Partial<ScoringSettings>) => scoring().updateSettings(patch),
    onSuccess: () => invalidate('scoring', 'config', 'leads', 'auditLogs'),
    meta: { errorTitle: 'Could not save scoring settings' },
  })
}

/** How many leads currently match each rule. */
export function useScoringUsage() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.scoring.usage,
    queryFn: () => scoring().usage(),
    enabled: ready,
  })
}

/** The hot/warm/cold split under a set of thresholds, for the live preview. */
export function useScoreDistribution(thresholds: ScoringThresholds, enabled: boolean) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.scoring.distribution(thresholds.hot, thresholds.warm),
    queryFn: () => scoring().distribution(thresholds),
    enabled: ready && enabled,
    placeholderData: (previous) => previous,
  })
}

export function useTestLeadScore() {
  return useMutation({
    mutationFn: (leadId: string) => scoring().testLead(leadId),
    meta: { errorTitle: 'Could not score this lead' },
  })
}

export function useStartRecalculation() {
  return useMutation({
    mutationFn: () => scoring().startRecalculation(),
    meta: { errorTitle: 'Could not start the recalculation' },
  })
}

/** Polls a recalculation job. Each poll advances the (simulated) background worker by one batch. */
export function useRecalculation(id: string | null) {
  const { keys, ready } = useWorkspace()
  const invalidate = useInvalidate()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: keys.scoring.job(id ?? ''),
    queryFn: async () => {
      const job = await scoring().getRecalculation(id ?? '')
      if (job.status === 'completed') {
        // Not the whole 'scoring' area: that would refetch this job query and loop.
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: keys.scoring.usage }),
          queryClient.invalidateQueries({ queryKey: [...keys.scoring.all, 'distribution'] }),
          invalidate('leads', 'notifications', 'auditLogs', 'reports'),
        ])
      }
      return job
    },
    enabled: ready && id !== null,
    refetchInterval: (query) => (query.state.data?.status === 'completed' ? false : 350),
    gcTime: 0,
  })
}
