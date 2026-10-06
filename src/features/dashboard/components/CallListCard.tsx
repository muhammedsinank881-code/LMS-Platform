import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton, Button } from '@/components/ui'
import { telHref } from '@/features/leads/lib/contact-links'
import { useCallList } from '../hooks/use-dashboard'
import type { ReportQuery } from '@/types'

export function CallListCard({ query }: { query: ReportQuery }) {
  const list = useCallList(query)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Call these leads today</CardTitle>
      </CardHeader>
      <CardContent>
        {list.isLoading ? <Skeleton className="h-40 w-full" /> : null}
        {list.isError ? (
          <EmptyState size="sm" tone="destructive" icon={AlertTriangle} title="Could not load leads" action={<Button size="sm" variant="outline" onClick={() => void list.refetch()}>Retry</Button>} />
        ) : null}
        {!list.isLoading && !list.isError && (list.data?.length ?? 0) === 0 ? (
          <EmptyState size="sm" title="No data for this period" description="No hot or overdue leads to call." />
        ) : null}
        <ul className="divide-y divide-border">
          {(list.data ?? []).map((lead) => {
            const tel = telHref(lead.phone)
            return (
              <li key={lead.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <Link to={`/leads/${lead.id}`} className="font-medium hover:underline">
                    {lead.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.reason === 'overdue' ? 'Overdue follow-up' : 'Hot lead'} · {lead.company}
                  </p>
                </div>
                {tel ? (
                  <Button asChild size="icon-sm" variant="outline">
                    <a href={tel} aria-label={`Call ${lead.name}`}>
                      <Phone aria-hidden="true" />
                    </a>
                  </Button>
                ) : null}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
