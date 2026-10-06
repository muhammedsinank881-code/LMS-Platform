import { TriangleAlert } from 'lucide-react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { Button, EmptyState } from '@/components/ui'
import { cn } from '@/lib/cn'

export interface RouteErrorBoundaryProps {
  /** Centre on a full-viewport page (root boundary) instead of inside the app shell. */
  fullPage?: boolean
}

function describeError(error: unknown): string {
  if (isRouteErrorResponse(error) && error.status === 404) return 'That page is not available.'
  if (isRouteErrorResponse(error) && (error.status === 401 || error.status === 403)) {
    return "You don't have access to this page."
  }
  return 'Reload the page and try again.'
}

export function RouteErrorBoundary({ fullPage = false }: RouteErrorBoundaryProps) {
  const error = useRouteError()

  return (
    <div className={cn(fullPage && 'flex min-h-dvh items-center justify-center bg-background p-4')}>
      <EmptyState
        tone="destructive"
        icon={TriangleAlert}
        title="Something went wrong"
        description={describeError(error)}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => window.location.reload()}>Reload page</Button>
            <Button asChild variant="outline">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        }
      />
    </div>
  )
}
