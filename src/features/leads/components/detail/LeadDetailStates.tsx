import { ShieldOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Skeleton } from '@/components/ui'

export function LeadDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading lead">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  )
}

export function LeadNotFound({ backTo }: { backTo: string }) {
  return (
    <EmptyState
      title="Lead not found"
      description="This lead may have been deleted, or the link is wrong."
      action={
        <Button asChild variant="outline">
          <Link to={{ pathname: '/leads', search: backTo }}>Back to leads</Link>
        </Button>
      }
    />
  )
}

export function LeadForbidden() {
  return (
    <EmptyState
      icon={ShieldOff}
      title="You can't open this lead"
      description="It sits outside the leads your role is allowed to see."
    />
  )
}

export function LeadLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      tone="destructive"
      title="Couldn't load this lead"
      description="Check your connection and try again."
      action={
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      }
    />
  )
}
