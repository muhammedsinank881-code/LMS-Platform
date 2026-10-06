import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import type { Lead } from '@/types'
import { useLeadRelations } from '../../../hooks/use-leads'

export function RelatedCard({ lead }: { lead: Lead }) {
  const relations = useLeadRelations(lead.id)
  if (relations.isLoading) return <Skeleton className="h-24 w-full" />
  const linked = relations.data?.linked ?? []
  const merged = relations.data?.mergedFrom ?? []

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Related leads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {linked.length === 0 && merged.length === 0 ? (
          <p className="text-muted-foreground">No linked records.</p>
        ) : null}
        {linked.map((item) => (
          <p key={item.id}>
            <Link className="font-medium text-primary hover:underline" to={`/leads/${item.id}`}>
              {item.name}
            </Link>
            <span className="text-muted-foreground"> · {item.id}</span>
          </p>
        ))}
        {merged.length > 0 ? <p className="text-xs font-medium text-muted-foreground">Merged from</p> : null}
        {merged.map((item) => (
          <p key={item.id}>
            {item.name} <span className="text-muted-foreground">· {item.id}</span>
          </p>
        ))}
      </CardContent>
    </Card>
  )
}
