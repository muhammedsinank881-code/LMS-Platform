import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'

interface SyllabusHeaderProps {
  onOpenUpdateModal: () => void
}

export function SyllabusHeader({ onOpenUpdateModal }: SyllabusHeaderProps) {
  return (
    <PageHeader
      title="Syllabus Completion"
      description="Track syllabus progress across your classes and batches."
      breadcrumbs={[
        { label: 'Dashboard', to: '/mentor/dashboard' },
        { label: 'Syllabus Completion' },
      ]}
      actions={
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onOpenUpdateModal}
          className="h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3.5 cursor-pointer font-semibold shadow-2xs hover:shadow-sm"
        >
          <Plus className="size-3.5 sm:size-4 mr-1 sm:mr-1.5" />
          <span>Update Progress</span>
        </Button>
      }
    />
  )
}
