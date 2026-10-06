import type { QueryClient, QueryKey } from '@tanstack/react-query'
import type { Paginated } from '@/types'

/** What a cache looked like before an optimistic edit, so a failed mutation can put it back. */
export type CacheSnapshot = Array<[QueryKey, unknown]>

interface HasId {
  id: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasId = (value: unknown): value is HasId => isRecord(value) && typeof value.id === 'string'

export const isPaginated = (value: unknown): value is Paginated<unknown> =>
  isRecord(value) && Array.isArray(value.items) && typeof value.total === 'number'

/** Applies `patch` to the entity with `id`, wherever it sits in a cached page, array or detail. */
function patchData<T extends HasId>(
  data: unknown,
  id: string,
  patch: (entity: T) => T,
): { data: unknown; changed: boolean } {
  const patchOne = (item: unknown): unknown => (hasId(item) && item.id === id ? patch(item as T) : item)

  if (isPaginated(data)) {
    const items = data.items.map(patchOne)
    return { data: { ...data, items }, changed: items.some((item, i) => item !== data.items[i]) }
  }
  if (Array.isArray(data)) {
    const items = data.map(patchOne)
    return { data: items, changed: items.some((item, i) => item !== data[i]) }
  }
  const next = patchOne(data)
  return { data: next, changed: next !== data }
}

/**
 * Optimistically edits one entity in every cached query under `prefixes` (list pages, boards,
 * detail views). Pending fetches for those queries are cancelled first so a slow response cannot
 * overwrite the edit. Returns a snapshot for `rollbackOptimistic`.
 */
export async function patchOptimistically<T extends HasId>(
  queryClient: QueryClient,
  prefixes: ReadonlyArray<QueryKey>,
  id: string,
  patch: (entity: T) => T,
): Promise<CacheSnapshot> {
  const snapshot: CacheSnapshot = []
  for (const queryKey of prefixes) {
    await queryClient.cancelQueries({ queryKey })
    for (const [key, data] of queryClient.getQueriesData({ queryKey })) {
      if (data === undefined) continue
      const result = patchData<T>(data, id, patch)
      if (!result.changed) continue
      snapshot.push([key, data])
      queryClient.setQueryData(key, result.data)
    }
  }
  return snapshot
}

/** Restores the caches an optimistic edit touched. */
export function rollbackOptimistic(queryClient: QueryClient, snapshot: CacheSnapshot | undefined) {
  // Newest first, so a cache captured twice (overlapping prefixes) ends at its original value.
  snapshot
    ?.slice()
    .reverse()
    .forEach(([key, data]) => queryClient.setQueryData(key, data))
}
