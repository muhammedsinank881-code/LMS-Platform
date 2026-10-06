import { Link } from 'react-router-dom'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ScoreBreakdownView } from './ScoreBreakdownView'
import type { Lead, ScoringThresholds } from '@/types'

export function ScoreCard({
  lead,
  thresholds,
  canEdit,
  pending,
  onRecalculate,
}: {
  lead: Lead
  thresholds?: ScoringThresholds
  canEdit: boolean
  pending?: boolean
  onRecalculate: () => void
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <ScoreBreakdownView
          result={{ score: lead.score, category: lead.scoreCategory, breakdown: lead.scoreBreakdown }}
          thresholds={thresholds}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={!canEdit} loading={pending} onClick={onRecalculate}>
            Recalculate
          </Button>
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link to="/settings/scoring">Scoring rules</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
