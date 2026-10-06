import { Link } from 'react-router-dom'
import { ChartCard } from '@/components/common/charts/ChartCard'
import { LEADERBOARD_LABELS, formatLeaderboardValue } from '../../lib/leaderboard-format'
import { Button } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { LEADERBOARD_METRICS, type LeaderboardMetric, type PerformanceQuery } from '@/types'
import { useLeaderboard } from '../../hooks/use-performance'
import { useState } from 'react'

/**
 * Ranked reps by revenue, deals won, conversion or response speed. Used on the manager
 * dashboard and the performance page. Names link to the rep view where the role allows it.
 */
export function LeaderboardWidget({
  query,
  initialMetric = 'revenue',
  limit = 8,
  className,
}: {
  query: PerformanceQuery
  initialMetric?: LeaderboardMetric
  limit?: number
  className?: string
}) {
  const { getScope } = usePermission()
  const [metric, setMetric] = useState<LeaderboardMetric>(initialMetric)
  const board = useLeaderboard(query, metric)
  const canOpenReps = getScope('reports') !== 'own'
  const entries = (board.data ?? []).slice(0, limit)
  const max = Math.max(1, ...entries.map((entry) => entry.value))

  return (
    <div className={className}>
      <ChartCard
        title="Team leaderboard"
        subtitle={metric === 'speed' ? 'Fastest average first response first' : `Ranked by ${LEADERBOARD_LABELS[metric].toLowerCase()}`}
        isLoading={board.isLoading}
        isError={board.isError}
        onRetry={() => void board.refetch()}
        isEmpty={entries.length === 0}
        summary={{
          caption: `Leaderboard by ${LEADERBOARD_LABELS[metric]}`,
          columns: [
            { key: 'rank', label: 'Rank' },
            { key: 'name', label: 'Salesperson' },
            { key: 'value', label: LEADERBOARD_LABELS[metric] },
          ],
          rows: entries.map((e) => [String(e.rank), e.name ?? 'Colleague', formatLeaderboardValue(metric, e.value)]),
        }}
        actions={null}
      >
        <div role="group" aria-label="Leaderboard metric" className="mb-3 flex flex-wrap gap-1.5">
          {LEADERBOARD_METRICS.map((item) => (
            <Button key={item} size="sm" variant={metric === item ? 'secondary' : 'ghost'} aria-pressed={metric === item} onClick={() => setMetric(item)}>
              {LEADERBOARD_LABELS[item]}
            </Button>
          ))}
        </div>
        <ol className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.userId} className="flex items-center gap-3">
              <span className="w-5 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{entry.rank}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  {canOpenReps && entry.name ? (
                    <Link to={`/reports/performance/${entry.userId}`} className="truncate font-medium hover:underline">
                      {entry.name}
                    </Link>
                  ) : (
                    <span className="truncate font-medium">{entry.name ?? 'Colleague'}{entry.isSelf ? ' (you)' : ''}</span>
                  )}
                  <span className="tabular-nums">{formatLeaderboardValue(metric, entry.value)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted" aria-hidden="true">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.max(4, (metric === 'speed' ? (max - entry.value) / max + 0.1 : entry.value / max) * 100)}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </ChartCard>
    </div>
  )
}
