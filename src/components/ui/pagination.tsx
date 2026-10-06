import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './button'
import { getPageRange } from './pagination-range'
import { Select } from './select'

export interface PaginationProps {
  /** 1-based current page. */
  page: number
  pageSize: number
  /** Total number of items across all pages. */
  total: number
  onPageChange: (page: number) => void
  /** When provided, a rows-per-page selector is shown. */
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  siblingCount?: number
  className?: string
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  siblingCount = 1,
  className,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(page, 1), pageCount)
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1
  const to = Math.min(current * pageSize, total)
  const items = getPageRange(current, pageCount, siblingCount)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 sm:justify-start">
        <p className="text-muted-foreground" aria-live="polite">
          {total === 0 ? (
            'No results'
          ) : (
            <>
              Showing{' '}
              <span className="font-medium text-foreground">
                {from}–{to}
              </span>{' '}
              of <span className="font-medium text-foreground">{total.toLocaleString()}</span>
            </>
          )}
        </p>
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="hidden text-muted-foreground sm:inline">
              Rows per page
            </span>
            <Select
              size="sm"
              className="w-20"
              aria-label="Rows per page"
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
              options={pageSizeOptions.map((size) => ({
                value: String(size),
                label: String(size),
              }))}
            />
          </div>
        ) : null}
      </div>

      <nav
        aria-label="Pagination"
        className="flex items-center justify-between gap-1 sm:justify-end"
      >
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>

        <span className="px-2 tabular-nums text-muted-foreground sm:hidden">
          Page {current} of {pageCount}
        </span>

        <ul className="hidden items-center gap-1 sm:flex">
          {items.map((item) =>
            typeof item === 'number' ? (
              <li key={item}>
                <Button
                  variant={item === current ? 'primary' : 'ghost'}
                  size="icon-sm"
                  aria-label={`Page ${item}`}
                  aria-current={item === current ? 'page' : undefined}
                  className="tabular-nums"
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </Button>
              </li>
            ) : (
              <li key={item} aria-hidden="true" className="w-8 text-center text-muted-foreground">
                …
              </li>
            ),
          )}
        </ul>

        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={current >= pageCount}
          onClick={() => onPageChange(current + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </nav>
    </div>
  )
}
