import { FileQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, EmptyState } from '@/components/ui'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
        action={
          <Button asChild>
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        }
      />
    </div>
  )
}
