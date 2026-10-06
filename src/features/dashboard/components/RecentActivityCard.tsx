import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton } from '@/components/ui'
import { formatRelative } from '@/lib/format'
import { useRecentActivity } from '../hooks/use-dashboard'
import type { ReportQuery } from '@/types'

export function RecentActivityCard({ query }: { query: ReportQuery }) {
  const activity = useRecentActivity(query)
  const items = activity.data ?? []
  return (
    <Card size="sm" className="h-full w-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.isLoading ? <Skeleton className="h-40 w-full" /> : null}
        {activity.isError ? (
          <EmptyState size="sm" tone="destructive" icon={AlertTriangle} title="Could not load activity" action={<Button size="sm" variant="outline" onClick={() => void activity.refetch()}>Retry</Button>} />
        ) : null}
        {!activity.isLoading && !activity.isError && items.length === 0 ? <EmptyState size="sm" title="No data for this period" /> : null}
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="text-sm">
              <Link to={`/leads/${item.leadId}`} className="font-medium hover:underline">
                {item.leadName}
              </Link>
              <span className="text-muted-foreground"> · {item.label}</span>
              <p className="text-xs text-muted-foreground">{formatRelative(item.createdAt)}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
