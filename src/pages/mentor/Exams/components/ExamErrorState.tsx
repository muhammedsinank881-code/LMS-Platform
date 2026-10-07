import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'

interface ExamErrorStateProps {
  onRetry: () => void
}

export function ExamErrorState({ onRetry }: ExamErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white dark:bg-card border border-rose-200 dark:border-rose-900/50 rounded-2xl text-center space-y-3 shadow-2xs">
      <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
        <AlertCircle className="size-8" />
      </div>
      <h3 className="text-lg font-bold text-[#17324D] dark:text-foreground tracking-tight">
        Unable to load exams
      </h3>
      <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-sm">
        Please try again. If the issue persists, check your internet connection or report a platform issue.
      </p>
      <Button
        type="button"
        variant="primary"
        onClick={onRetry}
        className="mt-2"
      >
        <RefreshCw className="size-4 mr-1.5" />
        <span>Try Again</span>
      </Button>
    </div>
  )
}
