import { Button } from '@/components/ui'
import type { SelectionMode } from './types'

export interface SelectionBannerProps {
  pageCount: number
  total: number
  selectedOnPage: number
  selectionMode: SelectionMode
  onSelectAllFiltered: () => void
  onClear: () => void
}

export function SelectionBanner({
  pageCount,
  total,
  selectedOnPage,
  selectionMode,
  onSelectAllFiltered,
  onClear,
}: SelectionBannerProps) {
  if (selectionMode === 'all') {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
        <p className="text-foreground">
          All <span className="font-medium">{total.toLocaleString()}</span> results selected
        </p>
        <Button variant="link" size="sm" onClick={onClear}>
          Clear selection
        </Button>
      </div>
    )
  }

  if (selectedOnPage < pageCount || total <= pageCount) return null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm">
      <p className="text-foreground">
        {selectedOnPage} on this page selected.
      </p>
      <Button variant="link" size="sm" onClick={onSelectAllFiltered}>
        Select all {total.toLocaleString()} results
      </Button>
    </div>
  )
}
