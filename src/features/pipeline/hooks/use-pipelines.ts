import { useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { PipelineInput, StageInput } from '@/services/api/pipelines'

/** Pipelines with their stages in order. Stable data, so it is cached for a while. */
export function usePipelines() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.pipelines.list,
    queryFn: () => api.pipelines.listAll(),
    enabled: ready,
    staleTime: 5 * 60_000,
  })
}

export function usePipeline(id: string | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.pipelines.detail(id ?? ''),
    queryFn: () => api.pipelines.get(id ?? ''),
    enabled: ready && Boolean(id),
  })
}

function usePipelineSettled() {
  const invalidate = useInvalidate()
  return () => invalidate('pipelines', 'deals', 'pipelineBoard', 'reports', 'auditLogs')
}

export function useCreatePipeline() {
  const settled = usePipelineSettled()
  return useMutation({
    mutationFn: (input: PipelineInput) => api.pipelines.create(input),
    onSuccess: settled,
    meta: { errorTitle: 'Could not create pipeline' },
  })
}

export function useUpdatePipeline() {
  const settled = usePipelineSettled()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PipelineInput> }) =>
      api.pipelines.update(id, patch),
    onSuccess: settled,
    meta: { errorTitle: 'Could not save pipeline' },
  })
}

export function useDeletePipeline() {
  const settled = usePipelineSettled()
  return useMutation({
    mutationFn: (input: string | { id: string; replacementId?: string }) =>
      typeof input === 'string'
        ? api.pipelines.delete(input)
        : api.pipelines.delete(input.id, { replacementId: input.replacementId }),
    onSuccess: settled,
    meta: { errorTitle: 'Could not delete pipeline' },
  })
}

export function useCreateStage() {
  const settled = usePipelineSettled()
  return useMutation({
    mutationFn: (input: StageInput) => api.pipelines.createStage(input),
    onSuccess: settled,
    meta: { errorTitle: 'Could not add stage' },
  })
}

export function useUpdateStage() {
  const settled = usePipelineSettled()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<StageInput, 'pipelineId'>> }) =>
      api.pipelines.updateStage(id, patch),
    onSuccess: settled,
    meta: { errorTitle: 'Could not save stage' },
  })
}

/** A stage that still holds deals is refused with CONFLICT. */
export function useDeleteStage() {
  const settled = usePipelineSettled()
  return useMutation({
    mutationFn: (input: string | { id: string; replacementId?: string }) =>
      typeof input === 'string'
        ? api.pipelines.deleteStage(input)
        : api.pipelines.deleteStage(input.id, { replacementId: input.replacementId }),
    onSuccess: settled,
    meta: { errorTitle: 'Could not delete stage' },
  })
}

export function useReorderStages() {
  const settled = usePipelineSettled()
  return useMutation({
    mutationFn: ({ pipelineId, orderedIds }: { pipelineId: string; orderedIds: string[] }) =>
      api.pipelines.reorderStages(pipelineId, orderedIds),
    onSuccess: settled,
    meta: { errorTitle: 'Could not reorder stages' },
  })
}
