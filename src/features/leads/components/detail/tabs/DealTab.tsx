import { Link } from 'react-router-dom'
import { CurrencyText } from '@/components/common/CurrencyText'
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton } from '@/components/ui'
import { formatDate } from '@/lib/format'
import { useDeals } from '@/features/deals/hooks/use-deals'
import { usePipelines } from '@/features/pipeline/hooks/use-pipelines'
import type { Lead } from '@/types'

export function DealTab({
  lead,
  canConvert,
  onConvert,
}: {
  lead: Lead
  canConvert: boolean
  onConvert: () => void
}) {
  const deals = useDeals({
    filters: [{ field: 'leadId', operator: 'equals', value: lead.id }],
    sort: [{ field: 'createdAt', direction: 'desc' }],
    pageSize: 1,
  })
  const pipelines = usePipelines()
  const deal = deals.data?.items[0]

  if (deals.isLoading) return <Skeleton className="h-32 w-full" />
  if (deals.isError) {
    return (
      <EmptyState
        size="sm"
        tone="destructive"
        title="Couldn't load the deal"
        action={<Button variant="outline" onClick={() => void deals.refetch()}>Retry</Button>}
      />
    )
  }
  if (!deal) {
    return (
      <EmptyState
        size="sm"
        title="No deal yet"
        description="Convert this lead into an opportunity when it is qualified."
        action={
          <Button type="button" disabled={!canConvert} onClick={onConvert}>
            Convert to deal
          </Button>
        }
      />
    )
  }

  const stage = pipelines.data?.flatMap((pipeline) => pipeline.stages).find((item) => item.id === deal.stageId)

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <Link className="hover:underline" to={`/deals/${deal.id}`}>
            {deal.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Value</dt>
            <dd><CurrencyText amount={deal.value} /></dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Stage</dt>
            <dd>{stage?.name ?? deal.stageId}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Probability</dt>
            <dd>{deal.probability}%</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Expected close</dt>
            <dd>{formatDate(deal.expectedCloseDate)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Expected revenue</dt>
            <dd><CurrencyText amount={deal.expectedRevenue} /></dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
