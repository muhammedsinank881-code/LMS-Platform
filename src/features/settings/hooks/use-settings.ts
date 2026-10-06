import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createConfigHooks, createOrderedConfigHooks } from '@/hooks/create-config-hooks'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { AssignmentSample, PermissionSettings, ProfileInput } from '@/services/api/settings'
import type { ScoringThresholds, WorkspaceSettings } from '@/types'

const { settings } = api

const customFields = createOrderedConfigHooks({
  name: 'customFields',
  label: 'custom field',
  client: settings.customFields,
  invalidates: ['leads', 'deals', 'auditLogs'],
})
const scoringRules = createOrderedConfigHooks({
  name: 'scoringRules',
  label: 'scoring rule',
  client: settings.scoringRules,
  // Saving a rule re-scores every lead.
  invalidates: ['leads', 'reports', 'scoring'],
})
const questions = createOrderedConfigHooks({
  name: 'qualificationQuestions',
  label: 'question',
  client: settings.qualificationQuestions,
  invalidates: ['leads', 'auditLogs'],
})
const assignmentRules = createOrderedConfigHooks({
  name: 'assignmentRules',
  label: 'assignment rule',
  client: settings.assignmentRules,
  invalidates: ['auditLogs'],
})
const lostReasons = createOrderedConfigHooks({
  name: 'lostReasons',
  label: 'lost reason',
  client: settings.lostReasons,
  invalidates: ['leads', 'deals', 'auditLogs'],
})
// Renaming or deleting a tag updates the leads that carry it.
const tags = createConfigHooks({
  name: 'tags',
  label: 'tag',
  client: settings.tags,
  invalidates: ['leads', 'auditLogs'],
})

export const useCustomFields = customFields.useList
export const useCreateCustomField = customFields.useCreate
export const useUpdateCustomField = customFields.useUpdate
export const useDeleteCustomField = customFields.useDelete
export const useReorderCustomFields = customFields.useReorder

export const useScoringRules = scoringRules.useList
export const useCreateScoringRule = scoringRules.useCreate
export const useUpdateScoringRule = scoringRules.useUpdate
export const useDeleteScoringRule = scoringRules.useDelete
export const useReorderScoringRules = scoringRules.useReorder

export const useQualificationQuestions = questions.useList
export const useCreateQualificationQuestion = questions.useCreate
export const useUpdateQualificationQuestion = questions.useUpdate
export const useDeleteQualificationQuestion = questions.useDelete
export const useReorderQualificationQuestions = questions.useReorder

export const useAssignmentRules = assignmentRules.useList
export const useCreateAssignmentRule = assignmentRules.useCreate
export const useUpdateAssignmentRule = assignmentRules.useUpdate
export const useDeleteAssignmentRule = assignmentRules.useDelete
export const useReorderAssignmentRules = assignmentRules.useReorder

export const useLostReasons = lostReasons.useList
export const useCreateLostReason = lostReasons.useCreate
export const useUpdateLostReason = lostReasons.useUpdate
export const useDeleteLostReason = lostReasons.useDelete
export const useReorderLostReasons = lostReasons.useReorder

export const useTags = tags.useList
export const useCreateTag = tags.useCreate
export const useUpdateTag = tags.useUpdate
export const useDeleteTag = tags.useDelete

export function useWorkspaceSettings() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.config.workspace,
    queryFn: () => settings.workspace.get(),
    enabled: ready,
    staleTime: 5 * 60_000,
  })
}

export function useUpdateWorkspaceSettings() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  return useMutation({
    mutationFn: (patch: Partial<WorkspaceSettings>) => settings.workspace.update(patch),
    onSuccess: async (saved) => {
      queryClient.setQueryData(keys.config.workspace, saved)
      await queryClient.invalidateQueries({ queryKey: keys.auditLogs.all })
    },
    meta: { errorTitle: 'Could not save workspace settings' },
  })
}

export function useScoringThresholds() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.config.scoringThresholds,
    queryFn: () => settings.scoringRules.getThresholds(),
    enabled: ready,
    staleTime: 5 * 60_000,
  })
}

export function useUpdateScoringThresholds() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  return useMutation({
    mutationFn: (thresholds: ScoringThresholds) => settings.scoringRules.updateThresholds(thresholds),
    onSuccess: async (saved) => {
      queryClient.setQueryData(keys.config.scoringThresholds, saved)
      // Categories (hot / warm / cold) are derived from the thresholds.
      await queryClient.invalidateQueries({ queryKey: keys.leads.all })
    },
    meta: { errorTitle: 'Could not save thresholds' },
  })
}

export function useUpdateProfile() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (patch: ProfileInput) => settings.profile.update(patch),
    onSuccess: () => invalidate('team', 'auditLogs'),
    meta: { errorTitle: 'Could not save profile' },
  })
}

export function useUpdatePermissions() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  return useMutation({
    mutationFn: (next: PermissionSettings) => settings.permissions.update(next),
    onSuccess: async (saved) => {
      queryClient.setQueryData(keys.config.permissions, saved)
      await queryClient.invalidateQueries({ queryKey: keys.root })
    },
    meta: { errorTitle: 'Could not save permissions' },
  })
}

export function useResetPermissions() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  return useMutation({
    mutationFn: () => settings.permissions.reset(),
    onSuccess: async (saved) => {
      queryClient.setQueryData(keys.config.permissions, saved)
      await queryClient.invalidateQueries({ queryKey: keys.root })
    },
    meta: { errorTitle: 'Could not reset permissions' },
  })
}

export function useBilling() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: [...keys.config.all, 'billing'] as const,
    queryFn: () => settings.billing.get(),
    enabled: ready,
  })
}

export function useEvaluateAssignment() {
  return useMutation({
    mutationFn: (sample: AssignmentSample) => settings.assignmentRules.evaluate(sample),
    meta: { errorTitle: 'Could not test the rule' },
  })
}

export function useMergeTags() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      settings.tags.merge(sourceId, targetId),
    onSuccess: () => invalidate('leads', 'auditLogs'),
    meta: { errorTitle: 'Could not merge tags' },
  })
}

export function useBulkDeleteTags() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (ids: string[]) => settings.tags.bulkDelete(ids),
    onSuccess: () => invalidate('leads', 'auditLogs'),
    meta: { errorTitle: 'Could not delete tags' },
  })
}
