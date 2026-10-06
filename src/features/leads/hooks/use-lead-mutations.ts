import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { patchOptimistically, rollbackOptimistic } from '@/lib/optimistic'
import { useAuthStore } from '@/store/auth-store'
import type { ResourceName } from '@/lib/queryKeys'
import { api } from '@/services'
import type {
  ChangeLeadStatusInput,
  ConvertToCustomerInput,
  ImportLeadsOptions,
  SaveQualificationInput,
  UpdateNoteInput,
} from '@/services/api/leads'
import type {
  Activity,
  CreateDealInput,
  CreateLeadInput,
  Lead,
  LeadId,
  LeadListParams,
  ManualActivityInput,
  UpdateLeadInput,
} from '@/types'
import { activityQueryAccepts, captureQueries, prependActivity } from '../lib/activity-cache'

/** Everything a lead change can ripple into: boards, reports, workload, notifications, history. */
export const LEAD_RELATED: ResourceName[] = [
  'leads',
  'followUps',
  'reports',
  'auditLogs',
  'team',
  'notifications',
]

/** Runs after any lead write: refetches the lead data and the things derived from it. */
function useLeadSettled() {
  const invalidate = useInvalidate()
  return () => invalidate(...LEAD_RELATED)
}

export function useCreateLead() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: (input: CreateLeadInput) => api.leads.create(input),
    onSuccess: settled,
    meta: { errorTitle: 'Could not create lead' },
  })
}

export function useUpdateLead() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: ({ id, patch }: { id: LeadId; patch: UpdateLeadInput }) => api.leads.update(id, patch),
    onSuccess: settled,
    meta: { errorTitle: 'Could not update lead' },
  })
}

export function useDeleteLead() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: (id: LeadId) => api.leads.delete(id),
    onSuccess: settled,
    meta: { errorTitle: 'Could not delete lead' },
  })
}

export function useBulkDeleteLeads() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: (ids: LeadId[]) => api.leads.bulkDelete(ids),
    onSuccess: settled,
    meta: { errorTitle: 'Could not delete leads' },
  })
}

export function useAssignLead() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: ({ id, userId, note }: { id: LeadId; userId: string; note?: string }) =>
      api.leads.assign(id, userId, note),
    onSuccess: settled,
    meta: { errorTitle: 'Could not assign lead' },
  })
}

export function useBulkAssignLeads() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: ({ ids, userId }: { ids: LeadId[]; userId: string }) =>
      api.leads.bulkAssign(ids, userId),
    onSuccess: settled,
    meta: { errorTitle: 'Could not assign leads' },
  })
}

export function useBulkChangeLeadStatus() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: ({ ids, ...input }: ChangeLeadStatusInput & { ids: LeadId[] }) =>
      api.leads.bulkChangeStatus(ids, input),
    onSuccess: settled,
    meta: { errorTitle: 'Could not change status' },
  })
}

export function useAddLeadTags() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: ({ ids, tags }: { ids: LeadId[]; tags: string[] }) => api.leads.addTags(ids, tags),
    onSuccess: settled,
    meta: { errorTitle: 'Could not add tags' },
  })
}

export function useRemoveLeadTags() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: ({ ids, tags }: { ids: LeadId[]; tags: string[] }) => api.leads.removeTags(ids, tags),
    onSuccess: settled,
    meta: { errorTitle: 'Could not remove tags' },
  })
}

export function useAutoAssignLeads() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: (ids: LeadId[]) => api.leads.autoAssign(ids),
    onSuccess: settled,
    meta: { errorTitle: 'Could not auto-assign leads' },
  })
}

export function useAddLeadActivity() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  const invalidate = useInvalidate()
  const actorId = useAuthStore((state) => state.user?.id ?? null)

  return useMutation({
    mutationFn: ({ id, input }: { id: LeadId; input: ManualActivityInput }) =>
      api.leads.addActivity(id, input),
    onMutate: async ({ id, input }) => {
      const lead = queryClient.getQueryData<Lead>(keys.leads.detail(id))
      const activity: Activity = {
        id: `optimistic-${crypto.randomUUID()}`,
        tenantId: lead?.tenantId ?? '',
        leadId: id,
        dealId: null,
        actorId,
        createdAt: new Date().toISOString(),
        ...input,
      }
      await queryClient.cancelQueries({ queryKey: keys.leads.activityLists(id) })
      const entries = queryClient.getQueriesData({ queryKey: keys.leads.activityLists(id) })
      const relevant = entries.filter((entry) => activityQueryAccepts(entry[0].at(-1), activity.type))
      const snapshot = captureQueries(relevant)
      for (const [key] of relevant) {
        queryClient.setQueryData(key, (current: unknown) => prependActivity(current, activity))
      }
      const leadSnapshot = await patchOptimistically<Lead>(
        queryClient,
        [keys.leads.detail(id)],
        id,
        (current) => ({
          ...current,
          lastContactedAt: activity.createdAt,
          firstResponseTimeMins: current.firstResponseTimeMins ?? 1,
        }),
      )
      return { snapshot: [...snapshot, ...leadSnapshot] }
    },
    onError: (_error, _variables, context) => rollbackOptimistic(queryClient, context?.snapshot),
    onSettled: () => invalidate(...LEAD_RELATED),
    meta: { errorTitle: 'Could not log activity' },
  })
}

export function useImportLeads() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: ({ rows, options }: { rows: CreateLeadInput[]; options?: ImportLeadsOptions }) =>
      api.leads.import(rows, options),
    onSuccess: settled,
    meta: { errorTitle: 'Import failed' },
  })
}

/** Fetches every lead matching the filters, for the caller to turn into a file. */
export function useExportLeads() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (params?: LeadListParams) => api.leads.exportRows(params),
    onSuccess: () => invalidate('auditLogs'),
    meta: { errorTitle: 'Export failed' },
  })
}

export function useConvertLeadToCustomer() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, input }: { id: LeadId; input?: ConvertToCustomerInput }) =>
      api.leads.convertToCustomer(id, input),
    onSuccess: () => invalidate(...LEAD_RELATED, 'customers', 'deals'),
    meta: { errorTitle: 'Could not convert lead' },
  })
}

export function useRecalculateLeadScore() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: (id: LeadId) => api.leads.recalculateScore(id),
    onSuccess: settled,
    meta: { errorTitle: 'Could not recalculate score' },
  })
}

export function useSaveQualification() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: ({ id, input }: { id: LeadId; input: SaveQualificationInput }) =>
      api.leads.saveQualification(id, input),
    onSuccess: settled,
    meta: { errorTitle: 'Could not save qualification' },
  })
}

export function useUpdateNote() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: ({ id, activityId, input }: { id: LeadId; activityId: string; input: UpdateNoteInput }) =>
      api.leads.updateNote(id, activityId, input),
    onSuccess: settled,
    meta: { errorTitle: 'Could not update note' },
  })
}

export function useDeleteNote() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: ({ id, activityId }: { id: LeadId; activityId: string }) => api.leads.deleteNote(id, activityId),
    onSuccess: settled,
    meta: { errorTitle: 'Could not delete note' },
  })
}

export function useSetNotePinned() {
  const settled = useLeadSettled()
  return useMutation({
    mutationFn: ({ id, activityId, pinned }: { id: LeadId; activityId: string; pinned: boolean }) =>
      api.leads.setNotePinned(id, activityId, pinned),
    onSuccess: settled,
    meta: { errorTitle: 'Could not update note' },
  })
}

export function useConvertLeadToDeal() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, input }: { id: LeadId; input: Omit<CreateDealInput, 'leadId'> }) =>
      api.leads.convertToDeal(id, input),
    onSuccess: () => invalidate(...LEAD_RELATED, 'deals'),
    meta: { errorTitle: 'Could not create deal' },
  })
}
