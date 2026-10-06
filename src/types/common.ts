/** Every tenant-owned entity carries the id of the workspace it belongs to. */
export interface TenantOwned {
  tenantId: string
}

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type Priority = (typeof PRIORITIES)[number]

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

/** Envelope a real REST backend would return. Clients here return the unwrapped `data`. */
export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: Record<string, unknown>
}

export type SortDirection = 'asc' | 'desc'

export interface SortParam<F extends string = string> {
  field: F
  direction: SortDirection
}

export const DATE_PRESETS = ['today', 'this_week', 'this_month', 'last_30_days'] as const
export type DatePreset = (typeof DATE_PRESETS)[number]

export const FILTER_OPERATORS = [
  'equals',
  'not_equals',
  'contains',
  'in',
  'gt',
  'lt',
  'between',
  'is_empty',
  'is_not_empty',
  'date_preset',
] as const
export type FilterOperator = (typeof FILTER_OPERATORS)[number]

export type FilterScalar = string | number | boolean

/** A single AND-combined condition. The union is discriminated by `operator`. */
export type FilterCondition<F extends string = string> =
  | { field: F; operator: 'equals' | 'not_equals'; value: FilterScalar }
  | { field: F; operator: 'contains'; value: string }
  | { field: F; operator: 'in'; value: ReadonlyArray<string | number> }
  | { field: F; operator: 'gt' | 'lt'; value: number | string }
  | { field: F; operator: 'between'; value: readonly [number | string, number | string] }
  | { field: F; operator: 'is_empty' | 'is_not_empty' }
  | { field: F; operator: 'date_preset'; value: DatePreset }

/** Shared by every list endpoint. `F` narrows the filterable/sortable field names per entity. */
export interface ListParams<F extends string = string> {
  page?: number
  pageSize?: number
  sort?: SortParam<F>[]
  search?: string
  filters?: FilterCondition<F>[]
}

export interface DateRange {
  /** ISO timestamps, inclusive. */
  from: string
  to: string
}
