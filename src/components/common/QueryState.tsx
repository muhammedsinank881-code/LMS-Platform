import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react'
import { Button, EmptyState, Skeleton } from '@/components/ui'

export function QueryState({
  isLoading,
  isError,
  onRetry,
  isEmpty = false,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Add one to get started.',
  emptyAction,
  emptyIcon = Inbox,
  loading,
  size,
  children = null,
}: {
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  emptyIcon?: LucideIcon
  /** Replaces the default skeleton block, e.g. with a list-shaped skeleton. */
  loading?: ReactNode
  size?: 'sm' | 'md'
  children?: ReactNode
}) {
  if (isLoading) {
    if (loading) return <div role="status" aria-busy="true">{loading}</div>
    return (
      <div role="status" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (isError) {
    return (
      <EmptyState
        tone="destructive"
        size={size}
        icon={AlertTriangle}
        title="Could not load this"
        description="Check your connection and try again."
        action={<Button onClick={onRetry}>Retry</Button>}
      />
    )
  }
  if (isEmpty) {
    return (
      <EmptyState icon={emptyIcon} size={size} title={emptyTitle} description={emptyDescription} action={emptyAction} />
    )
  }
  return children
}
