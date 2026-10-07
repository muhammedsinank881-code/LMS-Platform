import { Bell, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'

interface ResultsHeaderProps {
  onOpenEnterModal: () => void
}

export function ResultsHeader({ onOpenEnterModal }: ResultsHeaderProps) {
  const navigate = useNavigate()

  return (
    <PageHeader
      title="Results"
      description="View and manage student examination results"
      breadcrumbs={[
        { label: 'Mentor', to: '/mentor' },
        { label: 'Results' },
      ]}
      actions={
        <>
          <Button
            type="button"
            variant="primary"
            onClick={onOpenEnterModal}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            <span>Enter Results</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate('/mentor/notifications')}
            aria-label="Notifications"
            title="Notifications"
            className="relative"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
          </Button>
        </>
      }
    />
  )
}
