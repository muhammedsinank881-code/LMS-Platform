import { useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { SavedViewEntity, SavedViewInput } from '@/types'

/** Workspace presets plus the signed-in user's own views for one list screen. */
export function useSavedViews(entity: SavedViewEntity) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.savedViews.list(entity),
    queryFn: () => api.savedViews.listAll(entity),
    enabled: ready,
  })
}

export function useCreateSavedView() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: SavedViewInput) => api.savedViews.create(input),
    onSuccess: () => invalidate('savedViews'),
    meta: { errorTitle: 'Could not save view' },
  })
}

export function useUpdateSavedView() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<SavedViewInput> }) =>
      api.savedViews.update(id, patch),
    onSuccess: () => invalidate('savedViews'),
    meta: { errorTitle: 'Could not update view' },
  })
}

export function useDeleteSavedView() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.savedViews.delete(id),
    onSuccess: () => invalidate('savedViews'),
    meta: { errorTitle: 'Could not delete view' },
  })
}
