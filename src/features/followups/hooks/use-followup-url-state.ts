import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { useListUrlState, type UseListUrlState } from '@/hooks/use-list-url-state'
import type { FollowUpBucket, FollowUpFilterField } from '@/types'

const BUCKETS = new Set<string>(['overdue', 'today', 'tomorrow', 'upcoming'])

export interface FollowUpUrlExtras {
  display: 'list' | 'calendar'
  span: 'month' | 'week'
  period: string
  bucket: FollowUpBucket | null
  scope: 'mine' | 'team'
}

export interface FollowUpUrlState extends UseListUrlState<FollowUpFilterField>, FollowUpUrlExtras {
  setExtra: (patch: Partial<FollowUpUrlExtras>) => void
}

function readExtras(params: URLSearchParams): FollowUpUrlExtras {
  const bucket = params.get('bucket')
  return {
    display: params.get('display') === 'calendar' ? 'calendar' : 'list',
    span: params.get('span') === 'week' ? 'week' : 'month',
    period: params.get('period') ?? format(new Date(), 'yyyy-MM-dd'),
    bucket: bucket && BUCKETS.has(bucket) ? (bucket as FollowUpBucket) : null,
    scope: params.get('scope') === 'mine' ? 'mine' : 'team',
  }
}

export function useFollowUpUrlState(): FollowUpUrlState {
  const list = useListUrlState<FollowUpFilterField>({
    sort: [{ field: 'dueAt', direction: 'asc' }],
    pageSize: 200,
  })
  const [params, setParams] = useSearchParams()
  const extras = useMemo(() => readExtras(params), [params])

  const setExtra = (patch: Partial<FollowUpUrlExtras>) => {
    const next = new URLSearchParams(params)
    const merged = { ...extras, ...patch }
    next.set('display', merged.display)
    next.set('span', merged.span)
    next.set('period', merged.period)
    next.set('scope', merged.scope)
    if (merged.bucket) next.set('bucket', merged.bucket)
    else next.delete('bucket')
    if (merged.display === 'list') next.delete('display')
    if (merged.span === 'month') next.delete('span')
    if (merged.scope === 'team') next.delete('scope')
    setParams(next, { replace: true })
  }

  return { ...list, ...extras, setExtra }
}
