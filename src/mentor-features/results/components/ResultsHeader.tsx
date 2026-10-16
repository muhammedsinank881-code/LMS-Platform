import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'

interface ResultsHeaderProps {
  onOpenEnterModal: () => void
}

export function ResultsHeader({ onOpenEnterModal }: ResultsHeaderProps) {
  return (
    <PageHeader
      title="Results"
      description="View and manage student examination results"
      breadcrumbs={[
        { label: 'Mentor', to: '/mentor' },
        { label: 'Results' },
      ]}
      actions={
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onOpenEnterModal}
          className="h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3.5"
        >
          <Plus className="size-3.5 sm:size-4 mr-1 sm:mr-1.5" />
          <span>Enter Results</span>
        </Button>
      }
    />
  )
}
