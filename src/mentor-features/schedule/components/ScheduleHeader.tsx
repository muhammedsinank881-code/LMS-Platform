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
          size="sm"
          onClick={onOpenScheduleModal}
          className="h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3.5"
        >
          <Plus className="size-3.5 sm:size-4 mr-1 sm:mr-1.5" />
          <span>Schedule Class</span>
        </Button>
      }
    />
  )
}
