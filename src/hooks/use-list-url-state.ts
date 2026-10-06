import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  parseListUrlState,
  serializeListUrlState,
  type ListDisplayMode,
  type ListUrlDefaults,
  type ListUrlState,
} from './list-url-state'
import type { FilterCondition, SortParam } from '@/types'

export interface UseListUrlState<F extends string> extends ListUrlState<F> {
  setSearch: (search: string) => void
  setFilters: (filters: FilterCondition<F>[], viewId?: string | null) => void
  setSort: (sort: SortParam<F>[]) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setViewId: (viewId: string | null) => void
  setMode: (mode: ListDisplayMode) => void
  replace: (patch: Partial<ListUrlState<F>>) => void
  toListParams: () => {
    page: number
    pageSize: number
    sort: SortParam<F>[]
    search?: string
    filters?: FilterCondition<F>[]
  }
}

export function useListUrlState<F extends string>(
  defaults: ListUrlDefaults<F> = {},
): UseListUrlState<F> {
  const [params, setParams] = useSearchParams()
  const defaultSort = defaults.sort
  const defaultPageSize = defaults.pageSize
  const state = useMemo(
    () => parseListUrlState<F>(params, { sort: defaultSort, pageSize: defaultPageSize }),
    [params, defaultSort, defaultPageSize],
  )

  const replace = useCallback(
    (patch: Partial<ListUrlState<F>>) => {
      const next = { ...state, ...patch }
      setParams(
        serializeListUrlState(next, { sort: defaultSort, pageSize: defaultPageSize }, params),
        { replace: true },
      )
    },
    [defaultPageSize, defaultSort, params, setParams, state],
  )

  return {
    ...state,
    replace,
    setSearch: (search) => replace({ search, page: 1 }),
    setFilters: (filters, viewId) =>
      replace({ filters, viewId: viewId === undefined ? state.viewId : viewId, page: 1 }),
    setSort: (sort) => replace({ sort, page: 1 }),
    setPage: (page) => replace({ page }),
    setPageSize: (pageSize) => replace({ pageSize, page: 1 }),
    setViewId: (viewId) => replace({ viewId }),
    setMode: (mode) => replace({ mode }),
    toListParams: () => ({
      page: state.page,
      pageSize: state.pageSize,
      sort: state.sort,
      ...(state.search ? { search: state.search } : {}),
      ...(state.filters.length > 0 ? { filters: state.filters } : {}),
    }),
  }
}
