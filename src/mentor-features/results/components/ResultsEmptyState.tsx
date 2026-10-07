import { BarChart3, RefreshCw } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'

interface ResultsEmptyStateProps {
  isFilterActive?: boolean
  searchQuery?: string
  onResetFilters?: () => void
}

export function ResultsEmptyState({
  isFilterActive = false,
  searchQuery = '',
  onResetFilters,
}: ResultsEmptyStateProps) {
  if (isFilterActive) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No results match your filters"
        description={
          searchQuery
            ? `No matching student results found for "${searchQuery}". Try adjusting your search query or filters.`
            : 'No results found matching your selected class, exam, or status filters.'
        }
        action={
          onResetFilters ? (
            <Button
              type="button"
              variant="outline"
              onClick={onResetFilters}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              <span>Clear Filters</span>
            </Button>
          ) : undefined
        }
        className="rounded-lg border border-border bg-surface p-8"
      />
    )
  }

  return (
    <EmptyState
      icon={BarChart3}
      title="No results available"
      description="Student results for your assigned classes will appear here once examinations are graded and published."
      className="rounded-lg border border-border bg-surface p-12"
    />
  )
}
