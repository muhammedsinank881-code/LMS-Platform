import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'

interface ExamHeaderProps {
  onOpenCreateModal: () => void
}

export function ExamHeader({ onOpenCreateModal }: ExamHeaderProps) {
  return (
    <PageHeader
      title="Exams"
      description="View and manage exams for your assigned classes"
      breadcrumbs={[
        { label: 'Mentor', to: '/mentor' },
        { label: 'Exams' },
      ]}
      actions={
        <Button
          type="button"
          variant="primary"
          onClick={onOpenCreateModal}
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          <span>Create Exam</span>
        </Button>
      }
    />
  )
}
