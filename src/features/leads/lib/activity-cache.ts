import type { InfiniteData, QueryKey } from '@tanstack/react-query'
import { isPaginated, type CacheSnapshot } from '@/lib/optimistic'
import type { Activity, ActivityType, Paginated } from '@/types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isInfinite(value: unknown): value is InfiniteData<Paginated<Activity>> {
  return isRecord(value) && Array.isArray(value.pages)
}

/** True when a cached activity query should show this event. */
export function activityQueryAccepts(params: unknown, type: ActivityType): boolean {
  if (!isRecord(params) || !Array.isArray(params.types) || params.types.length === 0) return true
  return params.types.includes(type)
}

/** Inserts an activity at the top of a page or an infinite-query cache. */
export function prependActivity(data: unknown, activity: Activity): unknown {
  if (isInfinite(data)) {
    const [first, ...rest] = data.pages
    if (!first || !isPaginated(first)) return data
    return {
      ...data,
      pages: [{ ...first, items: [activity, ...first.items], total: first.total + 1 }, ...rest],
    }
  }
  if (isPaginated(data)) {
    return { ...data, items: [activity, ...data.items], total: data.total + 1 }
  }
  return data
}

/** Records the current cache entries so a failed write can restore them. */
export function captureQueries(entries: Array<[QueryKey, unknown]>): CacheSnapshot {
  return entries.map(([key, data]) => [key, data])
}
