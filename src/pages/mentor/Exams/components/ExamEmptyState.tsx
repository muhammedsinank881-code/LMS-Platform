import { Award, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'

interface ExamEmptyStateProps {
  isFilterActive?: boolean
  searchQuery?: string
  onResetFilters?: () => void
}

export function ExamEmptyState({
  isFilterActive = false,
  searchQuery = '',
  onResetFilters,
}: ExamEmptyStateProps) {
  if (isFilterActive) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl text-center space-y-3 shadow-2xs">
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#64748B]">
          <Award className="size-8" />
        </div>
        <h3 className="text-lg font-bold text-[#17324D] dark:text-foreground tracking-tight">
          No exams match your search
        </h3>
        <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-md">
          {searchQuery ? (
            <>
              No matching exams found for &quot;<span className="font-semibold text-[#17324D] dark:text-slate-200">{searchQuery}</span>&quot;.
            </>
          ) : (
            'No exams found matching your selected class or status filter.'
          )}{' '}
          Try adjusting your query or resetting filters.
        </p>
        {onResetFilters ? (
          <Button
            type="button"
            variant="outline"
            onClick={onResetFilters}
            className="mt-2 border-[#E2E8F0] text-[#17324D] dark:text-foreground font-semibold rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="size-4" />
            <span>Clear Filters</span>
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl text-center space-y-3 shadow-2xs">
      <div className="p-4 rounded-xl bg-primary-subtle text-primary">
        <Award className="size-10" />
      </div>
      <h3 className="text-xl font-bold text-[#17324D] dark:text-foreground tracking-tight">
        No exams found
      </h3>
      <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-sm">
        Exams for your assigned classes will appear here once scheduled by academic administration.
      </p>
    </div>
  )
}
