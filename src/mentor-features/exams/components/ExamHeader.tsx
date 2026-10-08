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
        { label: 'Mentor', to: '/mentor/dashboard' },
        { label: 'Exams' },
      ]}
      actions={
        <Button variant="primary" onClick={onOpenCreateModal}>
          <Plus className="h-4 w-4" /> Create Exam
        </Button>
      }
    />
  )
}

