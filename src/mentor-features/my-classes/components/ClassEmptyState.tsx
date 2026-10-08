import { BookOpen, RefreshCw } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'

interface ClassEmptyStateProps {
  isSearchActive?: boolean
  searchQuery?: string
  onResetFilters?: () => void
}

export function ClassEmptyState({
  isSearchActive = false,
  searchQuery = '',
  onResetFilters,
}: ClassEmptyStateProps) {
  if (isSearchActive) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No classes match your search"
        description={
          <>
            No matching classes found for &quot;<span className="font-semibold text-foreground">{searchQuery}</span>&quot;. Try refining your query or resetting filters.
          </>
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
              <span>Reset Search Filters</span>
            </Button>
          ) : undefined
        }
        className="rounded-lg border border-border bg-surface p-8"
      />
    )
  }

  return (
    <EmptyState
      icon={BookOpen}
      title="No classes assigned"
      description="Classes assigned to you will appear here. Contact your academic administrator if your assigned classes are missing."
      className="rounded-lg border border-border bg-surface p-12"
    />
  )
}
