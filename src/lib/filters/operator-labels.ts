import type { FilterOperator } from '@/types'

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'is',
  not_equals: 'is not',
  contains: 'contains',
  in: 'is any of',
  gt: 'greater than',
  lt: 'less than',
  between: 'between',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
  date_preset: 'is',
}
