import type { ReactNode } from 'react'
import type { RowData } from '@tanstack/table-core'
import type { LegacyColumnDef } from '@tanstack/react-table/legacy'
import type { SortParam } from '@/types'

export type TableDensity = 'comfortable' | 'compact'
export type SelectionMode = 'page' | 'all'
export type ColumnAlign = 'left' | 'center' | 'right'
export type DataTableColumn<T extends RowData> = LegacyColumnDef<T, unknown> & {
  meta?: DataTableColumnMeta
}
export type VisibilityState = Record<string, boolean>

export interface DataTableColumnMeta {
  align?: ColumnAlign
  className?: string
  sticky?: 'start'
}

export interface DataTableProps<T extends RowData> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  page: number
  pageSize: number
  total: number
  sort: SortParam[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSortChange(sort: SortParam[]): void
  density: TableDensity
  columnVisibility: VisibilityState
  onColumnVisibilityChange: (visibility: VisibilityState) => void
  selectedIds: string[]
  selectionMode: SelectionMode
  onSelectionChange: (ids: string[], mode: SelectionMode) => void
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  empty: ReactNode
  mode: 'table' | 'card'
  renderCard: (row: T) => ReactNode
  onRowClick?: (row: T) => void
  onRowIntent?: (row: T) => void
  stickyHeader?: boolean
}
