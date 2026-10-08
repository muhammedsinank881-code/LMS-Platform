import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'

interface ScheduleHeaderProps {
  onOpenScheduleModal: () => void
}

export function ScheduleHeader({ onOpenScheduleModal }: ScheduleHeaderProps) {
  return (
    <PageHeader
      title="Schedule & Classes"
      description="Schedule, manage, and track your upcoming classes."
      breadcrumbs={[
        { label: 'Dashboard', to: '/mentor/dashboard' },
        { label: 'Schedule & Classes' },
      ]}
      actions={
        <Button
          type="button"
          variant="primary"
          onClick={onOpenScheduleModal}
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          <span>Schedule Class</span>
        </Button>
      }
    />
  )
}
