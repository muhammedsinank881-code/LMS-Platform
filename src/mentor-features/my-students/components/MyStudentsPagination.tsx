import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MyStudentsPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function MyStudentsPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: MyStudentsPaginationProps) {
  if (totalCount === 0 || totalPages <= 1) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1 text-xs text-[#64748B] dark:text-slate-400">
      <div>
        Showing <span className="font-semibold text-[#17324D] dark:text-foreground">{startItem}</span> to{' '}
        <span className="font-semibold text-[#17324D] dark:text-foreground">{endItem}</span> of{' '}
        <span className="font-semibold text-[#17324D] dark:text-foreground">{totalCount}</span> students
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-border bg-white dark:bg-card text-[#17324D] dark:text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>

        <span className="px-2 font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-border bg-white dark:bg-card text-[#17324D] dark:text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
