import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'

interface ResultsErrorStateProps {
  onRetry: () => void
}

export function ResultsErrorState({ onRetry }: ResultsErrorStateProps) {
  return (
    <EmptyState
      tone="destructive"
      icon={AlertCircle}
      title="Unable to load results"
      description="Please try again. If the issue persists, check your internet connection or report a platform issue."
      action={
        <Button
          type="button"
          variant="primary"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="size-4" />
          <span>Try Again</span>
        </Button>
      }
      className="rounded-lg border border-destructive/20 bg-surface p-8"
    />
  )
}
