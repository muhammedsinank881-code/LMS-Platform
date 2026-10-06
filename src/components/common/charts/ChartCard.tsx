import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Skeleton } from '@/components/ui'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui'
import { ChartSummary, type SummaryColumn } from './ChartSummary'

export interface ChartCardProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  isEmpty?: boolean
  summary: { caption: string; columns: SummaryColumn[]; rows: string[][] }
  children: ReactNode
}

export function ChartCard({
  title,
  subtitle,
  actions,
  isLoading,
  isError,
  onRetry,
  isEmpty,
  summary,
  children,
}: ChartCardProps) {
  return (
    <Card size="sm" className="h-full min-w-0 w-full">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
        </div>
        {actions}
      </CardHeader>
      <CardContent className="min-w-0">
        {isLoading ? <Skeleton className="h-56 w-full" /> : null}
        {isError ? (
          <EmptyState
            size="sm"
            tone="destructive"
            icon={AlertTriangle}
            title="Could not load this report"
            action={
              <Button size="sm" variant="outline" onClick={onRetry}>
                Retry
              </Button>
            }
          />
        ) : null}
        {!isLoading && !isError && isEmpty ? (
          <EmptyState size="sm" title="No data for this period" />
        ) : null}
        {!isLoading && !isError && !isEmpty ? (
          <div className="min-w-0">
            {children}
            <ChartSummary {...summary} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
