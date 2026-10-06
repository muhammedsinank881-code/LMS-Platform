import type { FilterCondition, SortDirection, SortParam } from '@/types'

export type ListDisplayMode = 'table' | 'card'

export interface ListUrlState<F extends string = string> {
  search: string
  filters: FilterCondition<F>[]
  sort: SortParam<F>[]
  page: number
  pageSize: number
  viewId: string | null
  mode: ListDisplayMode
}

export interface ListUrlDefaults<F extends string = string> {
  sort?: SortParam<F>[]
  pageSize?: number
}

export const LIST_URL_DEFAULTS = {
  page: 1,
  pageSize: 25,
  mode: 'table' as const,
}

const DEFAULT_SORT: SortParam[] = [{ field: 'createdAt', direction: 'desc' }]

export function parseSort<F extends string>(raw: string | null): SortParam<F>[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [field, direction] = part.split(':')
      const dir: SortDirection = direction === 'asc' ? 'asc' : 'desc'
      return { field: (field ?? '') as F, direction: dir }
    })
    .filter((item) => item.field.length > 0)
}

export function serializeSort<F extends string>(sort: SortParam<F>[]): string {
  return sort.map((item) => `${item.field}:${item.direction}`).join(',')
}

export function parseFilters<F extends string>(raw: string | null): FilterCondition<F>[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as FilterCondition<F>[]) : []
  } catch {
    return []
  }
}

export function parseListUrlState<F extends string>(
  params: URLSearchParams,
  defaults: ListUrlDefaults<F> = {},
): ListUrlState<F> {
  const pageSize = Number(params.get('pageSize')) || defaults.pageSize || LIST_URL_DEFAULTS.pageSize
  const page = Number(params.get('page')) || LIST_URL_DEFAULTS.page
  const mode = params.get('mode') === 'card' ? 'card' : LIST_URL_DEFAULTS.mode
  const parsedSort = parseSort<F>(params.get('sort'))
  return {
    search: params.get('q') ?? '',
    filters: parseFilters<F>(params.get('f')),
    sort: parsedSort.length > 0 ? parsedSort : (defaults.sort ?? (DEFAULT_SORT as SortParam<F>[])),
    page: page > 0 ? page : 1,
    pageSize: pageSize > 0 ? pageSize : LIST_URL_DEFAULTS.pageSize,
    viewId: params.get('view'),
    mode,
  }
}

const MANAGED_KEYS = new Set(['q', 'f', 'sort', 'page', 'pageSize', 'view', 'mode'])

export function serializeListUrlState<F extends string>(
  state: ListUrlState<F>,
  defaults: ListUrlDefaults<F> = {},
  current?: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams()
  const defaultSort = defaults.sort ?? (DEFAULT_SORT as SortParam<F>[])
  const defaultPageSize = defaults.pageSize ?? LIST_URL_DEFAULTS.pageSize

  if (state.search) params.set('q', state.search)
  if (state.filters.length > 0) params.set('f', JSON.stringify(state.filters))
  if (serializeSort(state.sort) !== serializeSort(defaultSort)) {
    params.set('sort', serializeSort(state.sort))
  }
  if (state.page !== LIST_URL_DEFAULTS.page) params.set('page', String(state.page))
  if (state.pageSize !== defaultPageSize) params.set('pageSize', String(state.pageSize))
  if (state.viewId) params.set('view', state.viewId)
  if (state.mode !== LIST_URL_DEFAULTS.mode) params.set('mode', state.mode)
  current?.forEach((value, key) => {
    if (!MANAGED_KEYS.has(key)) params.set(key, value)
  })
  return params
}

export function listUrlStatesEqual<F extends string>(a: ListUrlState<F>, b: ListUrlState<F>): boolean {
  return serializeListUrlState(a).toString() === serializeListUrlState(b).toString()
}
