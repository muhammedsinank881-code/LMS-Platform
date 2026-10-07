import { Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'

interface AttendanceHeaderProps {
  onBack: () => void
  onSave: () => void
  savedSuccess: boolean
}

export function AttendanceHeader({
  onSave,
  savedSuccess,
}: AttendanceHeaderProps) {
  return (
    <PageHeader
      title="Attendance"
      description="Select class, set date, and log student attendance"
      breadcrumbs={[
        { label: 'Dashboard', to: '/mentor/dashboard' },
        { label: 'Attendance' },
      ]}
      actions={
        <Button
          type="button"
          variant="primary"
          onClick={onSave}
          className="h-9 px-4"
        >
          {savedSuccess ? (
            <>
              <Check className="size-4 mr-1.5" /> Saved!
            </>
          ) : (
            <>
              <Check className="size-4 mr-1.5" /> Save Attendance
            </>
          )}
        </Button>
      }
    />
  )
}
