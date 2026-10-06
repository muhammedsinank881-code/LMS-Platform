import { parseListUrlState } from '@/hooks/list-url-state'
import type { LeadFilterField, LeadListParams } from '@/types'

const STORAGE_KEY = 'leadflow:leads:return'

function hasListSearch(state: unknown): state is { listSearch: string } {
  return (
    typeof state === 'object' &&
    state !== null &&
    'listSearch' in state &&
    typeof state.listSearch === 'string'
  )
}

/** Remembers the leads-list query so detail can return to the same filters. */
export function rememberLeadListSearch(search: string): void {
  sessionStorage.setItem(STORAGE_KEY, search)
}

/** Prefers the navigation state, then the tab's session. */
export function readLeadListSearch(state: unknown): string {
  if (hasListSearch(state)) return state.listSearch
  return sessionStorage.getItem(STORAGE_KEY) ?? ''
}

/** Turns a stored leads-list query string into the params for previous/next. */
export function listParamsFromSearch(search: string): LeadListParams {
  const raw = search.startsWith('?') ? search.slice(1) : search
  const state = parseListUrlState<LeadFilterField>(new URLSearchParams(raw))
  return {
    page: state.page,
    pageSize: state.pageSize,
    sort: state.sort,
    search: state.search || undefined,
    filters: state.filters.length > 0 ? state.filters : undefined,
  }
}
