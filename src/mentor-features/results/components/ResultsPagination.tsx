import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'

interface ResultsPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function ResultsPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: ResultsPaginationProps) {
  if (totalPages <= 1) return null

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
      <div>
        Showing <span className="font-bold text-foreground">{start}</span> to{' '}
        <span className="font-bold text-foreground">{end}</span> of{' '}
        <span className="font-bold text-foreground">{totalCount}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="size-3.5" />
          <span>Previous</span>
        </Button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1
          const isActive = pageNum === currentPage

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`size-8 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              {pageNum}
            </button>
          )
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1"
        >
          <span>Next</span>
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
