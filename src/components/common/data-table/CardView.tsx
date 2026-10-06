import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface CardViewProps<T> {
  rows: T[]
  getRowId: (row: T) => string
  renderCard: (row: T) => ReactNode
  onRowClick?: (row: T) => void
  onRowIntent?: (row: T) => void
}

export function CardView<T>({ rows, getRowId, renderCard, onRowClick, onRowIntent }: CardViewProps<T>) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <li key={getRowId(row)}>
          <div
            role={onRowClick ? 'button' : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            className={cn(
              'h-full rounded-md border border-border bg-surface p-4',
              onRowClick &&
                'cursor-pointer hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            onMouseEnter={() => onRowIntent?.(row)}
            onFocus={() => onRowIntent?.(row)}
            onClick={() => onRowClick?.(row)}
            onKeyDown={(event) => {
              if (!onRowClick) return
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onRowClick(row)
              }
            }}
          >
            {renderCard(row)}
          </div>
        </li>
      ))}
    </ul>
  )
}
