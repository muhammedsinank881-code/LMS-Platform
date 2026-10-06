import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ConfigName, ResourceName } from '@/lib/queryKeys'
import { rollbackOptimistic } from '@/lib/optimistic'
import type { ConfigClient, Reorderable } from '@/services/api/resource'
import { useInvalidate, useWorkspace } from './use-workspace'

interface ConfigHookOptions<T, TCreate, TUpdate> {
  name: ConfigName
  /** Shown in the failure toast: "Could not save status". */
  label: string
  client: ConfigClient<T, TCreate, TUpdate>
  /** Other resources that read this configuration and must refetch after a change. */
  invalidates?: ResourceName[]
}

const CONFIG_STALE_MS = 5 * 60_000

/**
 * Query and mutation hooks for a workspace configuration list (statuses, tags, rules, ...).
 * One factory keeps every config screen on the same cache keys, invalidation and error handling.
 */
export function createConfigHooks<T extends { id: string }, TCreate, TUpdate>({
  name,
  label,
  client,
  invalidates = [],
}: ConfigHookOptions<T, TCreate, TUpdate>) {
  function useList() {
    const { keys, ready } = useWorkspace()
    return useQuery({
      queryKey: keys.config.list(name),
      queryFn: () => client.listAll(),
      enabled: ready,
      staleTime: CONFIG_STALE_MS,
    })
  }

  function useSettle() {
    const queryClient = useQueryClient()
    const invalidate = useInvalidate()
    const { keys } = useWorkspace()
    return () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.config.list(name) }),
        invalidate(...invalidates),
      ])
  }

  function useCreate() {
    const settle = useSettle()
    return useMutation({
      mutationFn: (input: TCreate) => client.create(input),
      onSuccess: settle,
      meta: { errorTitle: `Could not add ${label}` },
    })
  }

  function useUpdate() {
    const settle = useSettle()
    return useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: TUpdate }) => client.update(id, patch),
      onSuccess: settle,
      meta: { errorTitle: `Could not save ${label}` },
    })
  }

  function useDelete() {
    const settle = useSettle()
    return useMutation({
      mutationFn: (input: string | { id: string; replacementId?: string }) => {
      if (typeof input === 'string') return client.delete(input)
      return client.delete(input.id, { replacementId: input.replacementId })
    },
      onSuccess: settle,
      meta: { errorTitle: `Could not delete ${label}` },
    })
  }

  return { useList, useCreate, useUpdate, useDelete }
}

/** Same as `createConfigHooks`, plus a drag-to-reorder mutation that updates the list instantly. */
export function createOrderedConfigHooks<T extends { id: string }, TCreate, TUpdate>(
  options: ConfigHookOptions<T, TCreate, TUpdate> & { client: Reorderable },
) {
  const base = createConfigHooks(options)
  const { name, label, client } = options

  function useReorder() {
    const queryClient = useQueryClient()
    const { keys } = useWorkspace()
    const listKey = keys.config.list(name)

    return useMutation({
      mutationFn: (orderedIds: string[]) => client.reorder(orderedIds),
      onMutate: async (orderedIds) => {
        await queryClient.cancelQueries({ queryKey: listKey })
        const previous = queryClient.getQueryData<T[]>(listKey)
        if (previous) {
          const position = new Map(orderedIds.map((id, index) => [id, index]))
          const sorted = [...previous].sort(
            (a, b) => (position.get(a.id) ?? Infinity) - (position.get(b.id) ?? Infinity),
          )
          queryClient.setQueryData(listKey, sorted)
        }
        return { snapshot: previous ? [[listKey, previous] as const] : [] }
      },
      onError: (_error, _ids, context) =>
        rollbackOptimistic(queryClient, context?.snapshot.map(([k, v]) => [k, v])),
      onSettled: () => queryClient.invalidateQueries({ queryKey: listKey }),
      meta: { errorTitle: `Could not reorder ${label}` },
    })
  }

  return { ...base, useReorder }
}
