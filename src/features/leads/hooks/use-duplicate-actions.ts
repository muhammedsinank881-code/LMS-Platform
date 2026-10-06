import { useMutation } from '@tanstack/react-query'
import { useInvalidate } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { LeadId, LeadMergeChoices } from '@/types'
import { LEAD_RELATED } from './use-lead-mutations'

export function useMergeLeads() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      primaryId,
      secondaryId,
      choices,
    }: {
      primaryId: LeadId
      secondaryId: LeadId
      choices?: LeadMergeChoices
    }) => api.leads.merge(primaryId, secondaryId, choices),
    onSuccess: () => invalidate(...LEAD_RELATED, 'deals', 'conversations'),
    meta: { errorTitle: 'Could not merge leads' },
  })
}

/** "Keep Separate": the pair is no longer reported as duplicates. */
export function useKeepSeparate() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, otherId }: { id: LeadId; otherId: LeadId }) => api.leads.keepSeparate(id, otherId),
    onSuccess: () => invalidate('leads'),
    meta: { errorTitle: 'Could not update duplicates' },
  })
}

/** "Link Records": flags a lead as a duplicate of another without merging. */
export function useLinkDuplicate() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, targetId }: { id: LeadId; targetId: LeadId }) => api.leads.linkDuplicate(id, targetId),
    onSuccess: () => invalidate('leads'),
    meta: { errorTitle: 'Could not link records' },
  })
}
