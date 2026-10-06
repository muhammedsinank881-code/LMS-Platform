import type { FilterCondition, SortParam } from '@/types'

export function filtersMatch(
  a: FilterCondition[],
  b: FilterCondition[],
  sortA: SortParam[],
  sortB: SortParam[],
): boolean {
  return JSON.stringify(a) === JSON.stringify(b) && JSON.stringify(sortA) === JSON.stringify(sortB)
}
