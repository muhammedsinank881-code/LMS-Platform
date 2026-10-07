import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'

interface MyStudentsErrorStateProps {
  onRetry: () => void
}

export function MyStudentsErrorState({ onRetry }: MyStudentsErrorStateProps) {
  return (
    <div className="bg-surface border border-rose-200 dark:border-rose-900/40 rounded-md p-8 sm:p-12 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-[#DC2626] flex items-center justify-center mx-auto border border-rose-100">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground">
          Unable to load students
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          An error occurred while retrieving your assigned students list. Please check your connection and try again.
        </p>
      </div>
      <Button
        type="button"
        variant="primary"
        onClick={onRetry}
      >
        <RefreshCw className="size-3.5 mr-1.5" />
        <span>Try again</span>
      </Button>
    </div>
  )
}
