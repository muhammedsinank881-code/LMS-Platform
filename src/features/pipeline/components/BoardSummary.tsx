import { CurrencyText } from '@/components/common/CurrencyText'
import { Skeleton } from '@/components/ui'
import type { DealsSummary } from '@/types'

export function BoardSummary({
  summary,
  loading,
  compact = false,
}: {
  summary?: DealsSummary
  loading: boolean
  compact?: boolean
}) {
  if (loading && !summary) return <Skeleton className="h-5 w-48" />
  return (
    <p className="whitespace-nowrap text-sm text-muted-foreground" aria-live="polite">
      <CurrencyText amount={summary?.total ?? 0} compact={compact} />
      {' · '}
      <CurrencyText amount={summary?.weighted ?? 0} compact={compact} /> weighted
      {' · '}
      {summary?.count ?? 0} open
    </p>
  )
}
