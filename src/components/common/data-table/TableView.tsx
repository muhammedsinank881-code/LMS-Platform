import { flexRender } from '@tanstack/react-table'
import type { RowData } from '@tanstack/table-core'
import type { LegacyHeader, LegacyRow } from '@tanstack/react-table/legacy'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { DataTableColumnMeta, TableDensity } from './types'

export interface TableViewProps<T extends RowData> {
  headerGroups: Array<{ id: string; headers: LegacyHeader<T, unknown>[] }>
  rows: LegacyRow<T>[]
  density: TableDensity
  stickyHeader: boolean
  onRowClick?: (row: T) => void
  onRowIntent?: (row: T) => void
}

function columnMeta(def: { meta?: unknown }): DataTableColumnMeta {
  return (def.meta ?? {}) as DataTableColumnMeta
}

function alignClass(align: DataTableColumnMeta['align']) {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}

export function TableView<T extends RowData>({
  headerGroups,
  rows,
  density,
  stickyHeader,
  onRowClick,
  onRowIntent,
}: TableViewProps<T>) {
  const compact = density === 'compact'
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-max min-w-full border-separate border-spacing-0 text-sm">
        <thead>
          {headerGroups.map((group) => (
            <tr key={group.id} className="border-b border-border bg-muted/60">
              {group.headers.map((header) => {
                const meta = columnMeta(header.column.columnDef)
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={sortState(header.column.getCanSort(), header.column.getIsSorted())}
                    className={cn(
                      'whitespace-nowrap border-b border-border px-3 text-xs font-medium text-muted-foreground',
                      compact ? 'py-2' : 'py-2.5',
                      alignClass(meta.align),
                      stickyHeader && 'sticky top-0 z-10 bg-muted',
                      meta.className,
                    )}
                  >
                    {header.isPlaceholder ? null : <HeaderCell header={header} align={meta.align} />}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              tabIndex={onRowClick ? 0 : undefined}
              className={cn(
                'hover:bg-muted/40 [&:last-child>td]:border-b-0',
                onRowClick && 'cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-none',
              )}
              onMouseEnter={() => onRowIntent?.(row.original)}
              onFocus={() => onRowIntent?.(row.original)}
              onClick={() => onRowClick?.(row.original)}
              onKeyDown={(event) => {
                if (!onRowClick) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onRowClick(row.original)
                }
              }}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = columnMeta(cell.column.columnDef)
                return (
                  <td
                    key={cell.id}
                    className={cn(
                      'overflow-hidden whitespace-nowrap border-b border-border px-3 align-middle',
                      compact ? 'py-1.5' : 'py-2',
                      alignClass(meta.align),
                      meta.className,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HeaderCell<T extends RowData>({
  header,
  align,
}: {
  header: LegacyHeader<T, unknown>
  align?: DataTableColumnMeta['align']
}) {
  const canSort = header.column.getCanSort()
  const sorted = header.column.getIsSorted()
  const label = flexRender(header.column.columnDef.header, header.getContext())
  const name = typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id
  if (!canSort) return <span>{label}</span>
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1 rounded-sm text-muted-foreground hover:text-foreground',
        align === 'right' && 'w-full justify-end',
        align === 'center' && 'w-full justify-center',
      )}
      aria-label={sortLabel(name, sorted)}
      onClick={header.column.getToggleSortingHandler()}
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
      )}
    </button>
  )
}

function sortState(canSort: boolean, sorted: false | 'asc' | 'desc') {
  if (!canSort) return undefined
  if (sorted === 'asc') return 'ascending' as const
  if (sorted === 'desc') return 'descending' as const
  return 'none' as const
}

function sortLabel(name: string, sorted: false | 'asc' | 'desc') {
  if (sorted === 'asc') return `${name}, sorted ascending`
  if (sorted === 'desc') return `${name}, sorted descending`
  return `Sort by ${name}`
}
