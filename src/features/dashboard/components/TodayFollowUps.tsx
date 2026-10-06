import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Check } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton } from '@/components/ui'
import { useCompleteFollowUp } from '@/features/followups/hooks/use-followup-mutations'
import { useFollowUps } from '@/features/followups/hooks/use-followups'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { formatDateTime } from '@/lib/format'
import { TODAY_FOLLOWUPS } from '../lib/links'

export function TodayFollowUps() {
  const list = useFollowUps({
    pageSize: 8,
    filters: [
      { field: 'bucket', operator: 'equals', value: 'today' },
      { field: 'status', operator: 'not_equals', value: 'done' },
    ],
  })
  const leads = useLeads({ pageSize: 200 })
  const complete = useCompleteFollowUp()
  const names = useMemo(() => new Map((leads.data?.items ?? []).map((lead) => [lead.id, lead.name])), [leads.data?.items])
  const items = list.data?.items ?? []
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Today&apos;s follow-ups</CardTitle>
        <Link to={TODAY_FOLLOWUPS} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {list.isLoading ? <Skeleton className="h-40 w-full" /> : null}
        {list.isError ? (
          <EmptyState size="sm" tone="destructive" icon={AlertTriangle} title="Could not load follow-ups" action={<Button size="sm" variant="outline" onClick={() => void list.refetch()}>Retry</Button>} />
        ) : null}
        {!list.isLoading && !list.isError && items.length === 0 ? <EmptyState size="sm" title="No data for this period" description="Nothing is due today." /> : null}
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <Link to={`/leads/${item.leadId}`} className="font-medium hover:underline">
                  {names.get(item.leadId) ?? item.leadId}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {item.type} · {formatDateTime(item.dueAt)}
                </p>
              </div>
              <Button size="icon-sm" variant="outline" aria-label="Mark follow-up done" onClick={() => complete.mutate({ id: item.id })}>
                <Check aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
