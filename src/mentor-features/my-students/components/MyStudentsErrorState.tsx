import { AlertTriangle, RefreshCw } from 'lucide-react'

interface MyStudentsErrorStateProps {
  onRetry: () => void
}

export function MyStudentsErrorState({ onRetry }: MyStudentsErrorStateProps) {
  return (
    <div className="bg-white dark:bg-card border border-rose-200 dark:border-rose-900/40 rounded-xl p-8 sm:p-12 text-center space-y-4 shadow-2xs">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-[#DC2626] flex items-center justify-center mx-auto border border-rose-100">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-[#17324D] dark:text-foreground">
          Unable to load students
        </h3>
        <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
          An error occurred while retrieving your assigned students list. Please check your connection and try again.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F9F83] hover:bg-[#0b7e67] text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
      >
        <RefreshCw className="size-3.5" />
        <span>Try again</span>
      </button>
    </div>
  )
}
