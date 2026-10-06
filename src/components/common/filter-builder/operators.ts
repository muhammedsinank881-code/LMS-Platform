import { OPERATOR_LABELS } from '@/lib/filters/operator-labels'
import type { DatePreset, FilterOperator } from '@/types'

export type FilterFieldType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'multi-select'
  | 'user'
  | 'boolean'

export interface FilterFieldOption {
  value: string
  label: string
}

export interface FilterFieldConfig<F extends string = string> {
  id: F
  label: string
  type: FilterFieldType
  options?: FilterFieldOption[]
}

export interface FilterDraft<F extends string = string> {
  field: F
  operator: FilterOperator
  value?: unknown
}

export const OPERATORS_BY_TYPE: Record<FilterFieldType, FilterOperator[]> = {
  text: ['contains', 'equals', 'not_equals', 'is_empty', 'is_not_empty'],
  number: ['equals', 'gt', 'lt', 'between', 'is_empty', 'is_not_empty'],
  currency: ['equals', 'gt', 'lt', 'between', 'is_empty', 'is_not_empty'],
  date: ['date_preset', 'gt', 'lt', 'between', 'is_empty'],
  select: ['equals', 'not_equals', 'in', 'is_empty', 'is_not_empty'],
  user: ['equals', 'not_equals', 'in', 'is_empty', 'is_not_empty'],
  'multi-select': ['in', 'is_empty', 'is_not_empty'],
  boolean: ['equals'],
}

export const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_30_days', label: 'Last 30 days' },
]

export function operatorLabel(operator: FilterOperator): string {
  return OPERATOR_LABELS[operator]
}

export function defaultOperator(type: FilterFieldType): FilterOperator {
  return OPERATORS_BY_TYPE[type][0]
}

export function operatorsFor(type: FilterFieldType): { value: FilterOperator; label: string }[] {
  return OPERATORS_BY_TYPE[type].map((operator) => ({
    value: operator,
    label: operatorLabel(operator),
  }))
}

export function needsValue(operator: FilterOperator): boolean {
  return operator !== 'is_empty' && operator !== 'is_not_empty'
}
