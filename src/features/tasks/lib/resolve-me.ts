import type { FilterCondition } from '@/types'

/** Saved view "My tasks" stores assignee `me`. Swap it for the signed-in user before querying. */
export function resolveAssigneeMe<F extends string>(filters: FilterCondition<F>[], userId: string): FilterCondition<F>[] {
  return filters.map((filter) =>
    filter.field === 'assigneeId' && filter.operator === 'equals' && filter.value === 'me'
      ? { ...filter, value: userId }
      : filter,
  )
}
