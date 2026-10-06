import { LeadScoreBadge } from '@/components/common/LeadScoreBadge'
import { ScoreRing } from '@/components/ui/score-ring'
import { DEFAULT_SCORING_THRESHOLDS } from '@/lib/scoring'
import type { ScoreResult, ScoringThresholds } from '@/types'

/** The score, its category and the exact rule-by-rule breakdown. Shared by the lead's Score card and the scoring test panel. */
export function ScoreBreakdownView({
  result,
  thresholds,
}: {
  result: ScoreResult
  thresholds?: ScoringThresholds
}) {
  const limits = thresholds ?? DEFAULT_SCORING_THRESHOLDS
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <ScoreRing score={result.score} category={result.category} />
        <LeadScoreBadge score={result.score} category={result.category} />
      </div>
      <ul className="space-y-1 text-sm">
        {result.breakdown.length === 0 ? <li className="text-muted-foreground">No rules matched.</li> : null}
        {result.breakdown.map((item) => (
          <li key={item.rule.id} className="flex justify-between gap-3">
            <span>{item.rule.name}</span>
            <span className="tabular-nums">{item.points > 0 ? `+${item.points}` : item.points}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm font-medium">Total {result.score}</p>
      <p className="text-xs text-muted-foreground">
        Hot at {limits.hot}+ · Warm at {limits.warm}+
      </p>
    </div>
  )
}
