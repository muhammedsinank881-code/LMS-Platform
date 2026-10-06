import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatDate } from '@/lib/format'
import type { Lead } from '@/types'
import { FollowUpTime, RelativeTime } from '../../RelativeTime'

export function KeyDatesCard({ lead }: { lead: Lead }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Key dates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label="Created" value={formatDate(lead.createdAt)} />
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Last contacted</span>
          <RelativeTime value={lead.lastContactedAt} />
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Next follow-up</span>
          <FollowUpTime value={lead.nextFollowUpAt} />
        </div>
      </CardContent>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
