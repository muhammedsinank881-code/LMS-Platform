import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface ReportColumn<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  /** Makes the column sortable. Rows with null sort last. */
  sortValue?: (row: T) => number | string | null
  align?: 'left' | 'right'
}

export interface ReportTableProps<T> {
  caption: string
  columns: ReportColumn<T>[]
  rows: T[]
  getKey: (row: T) => string
  defaultSort?: { id: string; dir: 'asc' | 'desc' }
  /** A totals row, rendered in the footer (and last on mobile). */
  totals?: T
  onRowClick?: (row: T) => void
  className?: string
}

function compare(a: number | string | null, b: number | string | null): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))
}

/**
 * Sortable table that becomes a list of cards on small screens. The first column is the card
 * title. Sorting is by clicking a header button, so it works from the keyboard.
 */
export function ReportTable<T>({
  caption,
  columns,
  rows,
  getKey,
  defaultSort,
  totals,
  onRowClick,
  className,
}: ReportTableProps<T>) {
  const [sort, setSort] = useState(defaultSort ?? null)
  const sorted = useMemo(() => {
    const column = columns.find((c) => c.id === sort?.id)
    if (!column?.sortValue || !sort) return rows
    const value = column.sortValue
    // Nulls stay last in both directions.
    return [...rows].sort((a, b) => {
      const left = value(a)
      const right = value(b)
      if (left === null || right === null) return compare(left, right)
      return sort.dir === 'asc' ? compare(left, right) : compare(right, left)
    })
  }, [rows, columns, sort])

  const toggle = (id: string) =>
    setSort((current) => (current?.id === id ? { id, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { id, dir: 'desc' }))
  const [title, ...rest] = columns
  const all = totals ? [...sorted, totals] : sorted

  return (
    <div className={className}>
      <div className="hidden overflow-x-auto rounded-md border border-border md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              {columns.map((column) => {
                const active = sort?.id === column.id
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={active ? (sort?.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cn('px-3 py-2 font-medium', column.align === 'right' && 'text-right')}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggle(column.id)}
                        className="inline-flex items-center gap-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {column.header}
                        {active ? (
                          sort?.dir === 'asc' ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />
                        ) : null}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={getKey(row)}
                className={cn('border-b border-border last:border-0', onRowClick && 'cursor-pointer hover:bg-muted/40')}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column, index) => (
                  <td key={column.id} className={cn('px-3 py-2', column.align === 'right' && 'text-right tabular-nums')}>
                    {index === 0 ? <span className="font-medium">{column.cell(row)}</span> : column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {totals ? (
            <tfoot>
              <tr className="border-t border-border bg-muted/40 font-medium">
                {columns.map((column) => (
                  <td key={column.id} className={cn('px-3 py-2', column.align === 'right' && 'text-right tabular-nums')}>
                    {column.cell(totals)}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      <ul className="space-y-2 md:hidden" aria-label={caption}>
        {all.map((row, index) => (
          <li key={`${getKey(row)}-${index}`} className="rounded-md border border-border p-3">
            <p className="font-medium">{title?.cell(row)}</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              {rest.map((column) => (
                <div key={column.id}>
                  <dt className="text-xs text-muted-foreground">{column.header}</dt>
                  <dd className="tabular-nums">{column.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}
