import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CampaignFilterField, CampaignListParams, DateRange, FilterCondition, SortParam } from '@/types'
import { CAMPAIGN_PLATFORMS, CAMPAIGN_STATUSES } from '@/types'

export const CAMPAIGN_TABS = ['campaigns', 'whatsapp'] as const
export type CampaignTab = (typeof CAMPAIGN_TABS)[number]

export const SAVED_VIEWS = ['best-roas', 'overspending', 'active'] as const
export type CampaignSavedView = (typeof SAVED_VIEWS)[number]

export const SAVED_VIEW_LABELS: Record<CampaignSavedView, string> = {
  'best-roas': 'Best ROAS',
  overspending: 'Overspending',
  active: 'Active',
}

export const PAGE_SIZE = 15
const SORTABLE: readonly CampaignFilterField[] = ['name', 'spend', 'roas', 'leads', 'revenue', 'cpl', 'startDate']

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined =>
  value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined

const equals = (field: CampaignFilterField, value: string): FilterCondition<CampaignFilterField> => ({
  field,
  operator: 'equals',
  value,
})

/** URL-synced state for /campaigns: tab, search, filters, saved view, sort and page. */
export function useCampaignListUrl() {
  const [params, setParams] = useSearchParams()
  const tab = oneOf(params.get('ctab'), CAMPAIGN_TABS) ?? 'campaigns'
  const search = params.get('q') ?? ''
  const platform = oneOf(params.get('platform'), CAMPAIGN_PLATFORMS)
  const status = oneOf(params.get('status'), CAMPAIGN_STATUSES)
  const owner = params.get('owner') || undefined
  const view = oneOf(params.get('view'), SAVED_VIEWS)
  const sortField = oneOf(params.get('sort'), SORTABLE) ?? 'startDate'
  const sortDir = params.get('dir') === 'asc' ? 'asc' : 'desc'
  const page = Math.max(1, Number(params.get('page')) || 1)

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    if (!('page' in patch)) next.delete('page')
    setParams(next, { replace: true })
  }

  const sort: SortParam<CampaignFilterField>[] = useMemo(() => {
    if (view === 'best-roas' && !params.get('sort')) return [{ field: 'roas', direction: 'desc' }]
    return [{ field: sortField, direction: sortDir }]
  }, [view, params, sortField, sortDir])

  const toListParams = (range: DateRange): CampaignListParams => {
    const filters: FilterCondition<CampaignFilterField>[] = []
    if (platform) filters.push(equals('platform', platform))
    if (status) filters.push(equals('status', status))
    if (view === 'active' && !status) filters.push(equals('status', 'active'))
    if (view === 'overspending') filters.push({ field: 'overspent', operator: 'equals', value: true })
    if (owner) filters.push(equals('ownerId', owner))
    return { page, pageSize: PAGE_SIZE, sort, search: search || undefined, filters, range }
  }

  return {
    tab,
    search,
    platform,
    status,
    owner,
    view,
    sort,
    page,
    toListParams,
    setTab: (next: CampaignTab) => update({ ctab: next === 'campaigns' ? null : next }),
    setSearch: (value: string) => update({ q: value }),
    setPlatform: (value: string | null) => update({ platform: value }),
    setStatus: (value: string | null) => update({ status: value }),
    setOwner: (value: string | null) => update({ owner: value }),
    setView: (value: CampaignSavedView | null) => update({ view: value, sort: null, dir: null }),
    setSort: (next: SortParam[]) => {
      const first = next[0]
      update({ sort: first?.field ?? null, dir: first?.direction === 'asc' ? 'asc' : null })
    },
    setPage: (value: number) => update({ page: value > 1 ? String(value) : null }),
    clear: () => update({ q: null, platform: null, status: null, owner: null, view: null }),
    hasFilters: Boolean(search || platform || status || owner || view),
  }
}

export type CampaignListUrl = ReturnType<typeof useCampaignListUrl>
