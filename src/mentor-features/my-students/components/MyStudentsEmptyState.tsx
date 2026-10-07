import { GraduationCap, SearchX } from 'lucide-react'

interface MyStudentsEmptyStateProps {
  isSearch: boolean
  searchQuery?: string
  onResetFilters?: () => void
}

export function MyStudentsEmptyState({
  isSearch,
  searchQuery,
  onResetFilters,
}: MyStudentsEmptyStateProps) {
  if (isSearch) {
    return (
      <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-8 sm:p-12 text-center space-y-3 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-[#64748B] flex items-center justify-center mx-auto">
          <SearchX className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#17324D] dark:text-foreground">
            No matching students found
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
            No students found matching "{searchQuery}". Try adjusting your search query or filters.
          </p>
        </div>
        {onResetFilters ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 text-xs font-semibold text-[#0F9F83] hover:bg-[#0F9F83]/10 rounded-lg transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-8 sm:p-12 text-center space-y-3 shadow-2xs">
      <div className="w-14 h-14 rounded-full bg-[#0F9F83]/10 text-[#0F9F83] flex items-center justify-center mx-auto border border-[#0F9F83]/20">
        <GraduationCap className="size-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-[#17324D] dark:text-foreground">
          No students assigned yet
        </h3>
        <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
          Students assigned to you will appear here.
        </p>
      </div>
    </div>
  )
}
