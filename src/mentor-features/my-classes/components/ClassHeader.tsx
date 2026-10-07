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
        { label: 'Mentor', to: '/mentor' },
        { label: 'My Classes' },
      ]}
      
    />
  )
}
