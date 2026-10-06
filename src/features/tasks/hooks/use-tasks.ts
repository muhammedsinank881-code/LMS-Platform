import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { patchOptimistically, rollbackOptimistic } from '@/lib/optimistic'
import { api } from '@/services'
import type { CreateTaskInput, Task, TaskId, TaskListParams, UpdateTaskInput } from '@/types'

export function useTasks(params?: TaskListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.tasks.list(params),
    queryFn: () => api.tasks.list(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useTask(id: TaskId | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.tasks.detail(id ?? ''),
    queryFn: () => api.tasks.get(id as TaskId),
    enabled: ready && Boolean(id),
  })
}

export function useCreateTask() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: CreateTaskInput) => api.tasks.create(input),
    onSuccess: () => invalidate('tasks'),
    meta: { errorTitle: 'Could not create task' },
  })
}

export function useUpdateTask() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, patch }: { id: TaskId; patch: UpdateTaskInput }) => api.tasks.update(id, patch),
    onSuccess: () => invalidate('tasks'),
    meta: { errorTitle: 'Could not update task' },
  })
}

export function useDeleteTask() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: TaskId) => api.tasks.delete(id),
    onSuccess: () => invalidate('tasks'),
    meta: { errorTitle: 'Could not delete task' },
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: TaskId) => api.tasks.complete(id),
    onMutate: async (id) => ({
      snapshot: await patchOptimistically<Task>(
        queryClient,
        [keys.tasks.lists, keys.tasks.detail(id)],
        id,
        (task) => ({ ...task, status: 'done', completedAt: new Date().toISOString() }),
      ),
    }),
    onError: (_error, _variables, context) => rollbackOptimistic(queryClient, context?.snapshot),
    onSettled: () => invalidate('tasks'),
    meta: { errorTitle: 'Could not complete task' },
  })
}

export function useReopenTask() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: TaskId) => api.tasks.reopen(id),
    onSuccess: () => invalidate('tasks'),
    meta: { errorTitle: 'Could not reopen task' },
  })
}
