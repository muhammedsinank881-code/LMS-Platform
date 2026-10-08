import { GraduationCap, SearchX } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'

interface MyStudentsEmptyStateProps {
  isSearch: boolean
  searchQuery?: string
  onResetFilters?: () => void
}

export function MyStudentsEmptyState({
  isSearch,
  searchQuery,
  onResetFilters,
}: MyStudentsEmptyStateProps) {
  if (isSearch) {
    return (
      <EmptyState
        icon={SearchX}
        title="No matching students found"
        description={
          searchQuery
            ? `No students found matching "${searchQuery}". Try adjusting your search query or filters.`
            : 'No students found matching current filters.'
        }
        action={
          onResetFilters ? (
            <Button type="button" variant="outline" onClick={onResetFilters}>
              Clear all filters
            </Button>
          ) : undefined
        }
        className="rounded-md border border-border bg-surface p-8"
      />
    )
  }

  return (
    <EmptyState
      icon={GraduationCap}
      title="No students assigned yet"
      description="Students assigned to you will appear here."
      className="rounded-md border border-border bg-surface p-12"
    />
  )
}

