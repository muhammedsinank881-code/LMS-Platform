import { BookOpen, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'

interface ClassEmptyStateProps {
  isSearchActive?: boolean
  searchQuery?: string
  onResetFilters?: () => void
}

export function ClassEmptyState({
  isSearchActive = false,
  searchQuery = '',
  onResetFilters,
}: ClassEmptyStateProps) {
  if (isSearchActive) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl text-center space-y-3 shadow-2xs">
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#64748B]">
          <BookOpen className="size-8" />
        </div>
        <h3 className="text-lg font-bold text-[#17324D] dark:text-foreground tracking-tight">
          No classes match your search
        </h3>
        <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-md">
          No matching classes found for &quot;<span className="font-semibold text-[#17324D] dark:text-slate-200">{searchQuery}</span>&quot;. Try refining your query or resetting filters.
        </p>
        {onResetFilters ? (
          <Button
            type="button"
            variant="outline"
            onClick={onResetFilters}
            className="mt-2 border-[#E2E8F0] text-[#17324D] dark:text-foreground font-semibold rounded-xl flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            <span>Reset Search Filters</span>
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl text-center space-y-3 shadow-2xs">
      <div className="p-4 rounded-2xl bg-[#E8F7F3] text-[#0F9F83]">
        <BookOpen className="size-10" />
      </div>
      <h3 className="text-xl font-bold text-[#17324D] dark:text-foreground tracking-tight">
        No classes assigned
      </h3>
      <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-sm">
        Classes assigned to you will appear here. Contact your academic administrator if your assigned classes are missing.
      </p>
    </div>
  )
}
