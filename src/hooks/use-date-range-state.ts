import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  calendarDayKey,
  isRangePreset,
  rangeForPreset,
  rangeFromDays,
  type RangePreset,
} from '@/lib/date-range'
import type { Attribution, BreakdownDimension, ReportQuery, ReportTab, SeriesGranularity } from '@/types'
import { BREAKDOWN_DIMENSIONS, REPORT_TABS, SERIES_GRAINS } from '@/types'

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

export function useDateRangeState() {
  const [params, setParams] = useSearchParams()
  const preset = isRangePreset(params.get('preset')) ? (params.get('preset') as RangePreset) : '30d'
  const compare = params.get('compare') !== '0'
  const tab = oneOf(params.get('tab'), REPORT_TABS, 'leads')
  const dimension = oneOf(params.get('dim'), BREAKDOWN_DIMENSIONS, 'source')
  const granularity = oneOf(params.get('grain'), SERIES_GRAINS, 'day')
  const sourceId = params.get('source') || undefined
  const userId = params.get('owner') || undefined
  const campaignId = params.get('campaign') || undefined
  const teamId = params.get('team') || undefined
  const attribution: Attribution = params.get('attr') === 'first' ? 'first' : 'last'
  const stuckDays = [7, 14, 30, 60].includes(Number(params.get('stuck'))) ? Number(params.get('stuck')) : 14
  const campaignView = ['campaign', 'platform', 'adset', 'ad'].includes(params.get('by') ?? '') ? (params.get('by') as 'campaign' | 'platform' | 'adset' | 'ad') : 'campaign'

  const range = useMemo(() => {
    if (preset === 'custom') {
      const custom = rangeFromDays(params.get('from') ?? '', params.get('to') ?? '')
      if (custom) return custom
    }
    return rangeForPreset(preset === 'custom' ? '30d' : preset, new Date())
  }, [params, preset])

  const query: ReportQuery = {
    range,
    compare,
    ...(sourceId ? { sourceId } : {}),
    ...(userId ? { userId } : {}),
    ...(campaignId ? { campaignId } : {}),
    ...(teamId ? { teamId } : {}),
  }

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key)
      else next.set(key, value)
    }
    setParams(next, { replace: true })
  }

  return {
    preset,
    range,
    compare,
    tab,
    dimension,
    granularity,
    sourceId,
    userId,
    campaignId,
    teamId,
    attribution,
    stuckDays,
    campaignView,
    query,
    fromDay: calendarDayKey(range.from) ?? '',
    toDay: calendarDayKey(range.to) ?? '',
    setPreset: (next: Exclude<RangePreset, 'custom'>) => update({ preset: next, from: null, to: null }),
    setCustom: (fromDay: string, toDay: string) => update({ preset: 'custom', from: fromDay, to: toDay }),
    setCompare: (on: boolean) => update({ compare: on ? null : '0' }),
    setTab: (next: ReportTab) => update({ tab: next === 'leads' ? null : next }),
    setDimension: (next: BreakdownDimension) => update({ dim: next === 'source' ? null : next }),
    setGranularity: (next: SeriesGranularity) => update({ grain: next === 'day' ? null : next }),
    setAttribution: (next: Attribution) => update({ attr: next === 'last' ? null : next }),
    setStuckDays: (next: number) => update({ stuck: next === 14 ? null : String(next) }),
    setCampaignView: (next: 'campaign' | 'platform' | 'adset' | 'ad') => update({ by: next === 'campaign' ? null : next }),
    setFilter: (key: 'source' | 'owner' | 'campaign' | 'team', value: string | null) => update({ [key]: value }),
  }
}

export type DateRangeState = ReturnType<typeof useDateRangeState>
