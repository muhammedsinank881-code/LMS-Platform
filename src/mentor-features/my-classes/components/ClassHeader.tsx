import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'

interface ClassHeaderProps {
  onOpenAddModal: () => void
}

export function ClassHeader({ onOpenAddModal }: ClassHeaderProps) {
  return (
    <PageHeader
      title="My Classes"
      description="View and manage the classes assigned to you"
      breadcrumbs={[
        { label: 'Mentor', to: '/mentor/dashboard' },
        { label: 'My Classes' },
      ]}
      actions={
        <Button variant="primary" size="sm" onClick={onOpenAddModal} className="h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3.5">
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" /> Add Class
        </Button>
      }
    />
  )
}

