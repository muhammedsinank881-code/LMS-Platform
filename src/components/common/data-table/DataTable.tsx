import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { RowData } from '@tanstack/table-core'
import { useLegacyTable } from '@tanstack/react-table/legacy'
import { Button, EmptyState, Pagination, Skeleton } from '@/components/ui'
import { useMediaQuery } from '@/hooks/use-media-query'
import { CardView } from './CardView'
import { SelectionBanner } from './SelectionBanner'
import { TableView } from './TableView'
import type { DataTableProps } from './types'

export function DataTable<T extends RowData>(props: DataTableProps<T>) {
  const {
    columns,
    data,
    getRowId,
    page,
    pageSize,
    total,
    sort,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    density,
    columnVisibility,
    onColumnVisibilityChange,
    selectedIds,
    selectionMode,
    onSelectionChange,
    isLoading,
    isError,
    onRetry,
    empty,
    mode,
    renderCard,
    onRowClick,
    onRowIntent,
    stickyHeader = true,
  } = props

  const isMobile = useMediaQuery('(max-width: 1023px)')
  const showCards = isMobile || mode === 'card'
  const pageIds = data.map(getRowId)
  const selectedOnPage = pageIds.filter((id) => selectedIds.includes(id)).length

  const sorting = useMemo(
    () => sort.map((item) => ({ id: item.field, desc: item.direction === 'desc' })),
    [sort],
  )
  const rowSelection = useMemo(() => {
    const selected: Record<string, true> = {}
    for (const id of selectedIds) selected[id] = true
    return selected
  }, [selectedIds])

  const table = useLegacyTable({
    data,
    columns,
    getRowId,
    state: { sorting, columnVisibility, rowSelection },
    enableRowSelection: true,
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      onSortChange(
        next.map((item) => ({
          field: item.id,
          direction: item.desc ? 'desc' : 'asc',
        })),
      )
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnVisibility) : updater
      onColumnVisibilityChange(next)
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      onSelectionChange(Object.keys(next).filter((id) => next[id]), 'page')
    },
  })

  if (isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        tone="destructive"
        title="Could not load this list"
        description="Check your connection and try again."
        action={
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        }
      />
    )
  }

  if (isLoading && data.length === 0) {
    return <TableSkeleton />
  }

  if (!isLoading && data.length === 0) {
    return <>{empty}</>
  }

  return (
    <div className="space-y-3" aria-busy={isLoading || undefined}>
      <SelectionBanner
        pageCount={pageIds.length}
        total={total}
        selectedOnPage={selectedOnPage}
        selectionMode={selectionMode}
        onSelectAllFiltered={() => onSelectionChange(pageIds, 'all')}
        onClear={() => onSelectionChange([], 'page')}
      />
      {showCards ? (
        <CardView
          rows={data}
          getRowId={getRowId}
          renderCard={renderCard}
          onRowClick={onRowClick}
          onRowIntent={onRowIntent}
        />
      ) : (
        <TableView
          headerGroups={table.getHeaderGroups()}
          rows={table.getRowModel().rows}
          density={density}
          stickyHeader={stickyHeader}
          onRowClick={onRowClick}
          onRowIntent={onRowIntent}
        />
      )}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-md border border-border p-4" role="status" aria-label="Loading">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton shape="rect" className="h-4 w-4" />
          <Skeleton shape="text" className="h-4 flex-1" />
          <Skeleton shape="text" className="h-4 w-24" />
          <Skeleton shape="text" className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}
