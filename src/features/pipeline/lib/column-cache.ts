import type { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query'
import type { CacheSnapshot } from '@/lib/optimistic'
import type { Paginated } from '@/types'

type Pages<T> = InfiniteData<Paginated<T>, number>

function isPages<T extends { id: string }>(value: unknown): value is Pages<T> {
  if (typeof value !== 'object' || value === null || !('pages' in value)) return false
  const pages = (value as { pages: unknown }).pages
  return Array.isArray(pages)
}

export function readColumn<T extends { id: string }>(data: unknown): T[] {
  if (!isPages<T>(data)) return []
  return data.pages.flatMap((page) => page.items)
}

function rewrite<T extends { id: string }>(data: Pages<T>, items: T[], totalDelta: number): Pages<T> {
  const [first, ...rest] = data.pages
  if (!first) return data
  const pageSize = first.pageSize
  const all = items
  const pages = data.pages.map((page, index) => ({
    ...page,
    items: all.slice(index * pageSize, index * pageSize + pageSize),
    total: Math.max(0, first.total + totalDelta),
  }))
  if (pages.length === 0) return { ...data, pages: [{ ...first, items: [], total: 0 }] }
  return { ...data, pages: rest.length >= 0 ? pages : data.pages }
}

/** Moves one card between two infinite column caches. Returns the snapshot to roll back. */
export function moveColumnCard<T extends { id: string; position: number }>(
  client: QueryClient,
  sourceKey: QueryKey,
  destKey: QueryKey,
  card: T,
  position: number,
): CacheSnapshot {
  const snapshot: CacheSnapshot = []
  const source = client.getQueryData<Pages<T>>(sourceKey)
  const dest = client.getQueryData<Pages<T>>(destKey)
  if (source) snapshot.push([sourceKey, source])
  if (dest && destKey !== sourceKey) snapshot.push([destKey, dest])

  const next = { ...card, position }
  if (sourceKey === destKey && source) {
    const items = readColumn<T>(source).map((item) => (item.id === card.id ? next : item))
    items.sort((a, b) => a.position - b.position)
    client.setQueryData(sourceKey, rewrite(source, items, 0))
    return snapshot
  }
  if (source) {
    const items = readColumn<T>(source).filter((item) => item.id !== card.id)
    client.setQueryData(sourceKey, rewrite(source, items, -1))
  }
  if (dest) {
    const items = readColumn<T>(dest).filter((item) => item.id !== card.id)
    items.push(next)
    items.sort((a, b) => a.position - b.position)
    client.setQueryData(destKey, rewrite(dest, items, 1))
  }
  return snapshot
}
