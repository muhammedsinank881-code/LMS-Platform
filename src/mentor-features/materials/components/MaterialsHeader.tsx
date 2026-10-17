import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'

interface MaterialsHeaderProps {
  onOpenUploadModal: () => void
}

export function MaterialsHeader({ onOpenUploadModal }: MaterialsHeaderProps) {
  return (
    <PageHeader
      title="Learning Materials"
      description="Upload and manage notes, PDFs, and video classes for your students."
      breadcrumbs={[
        { label: 'Dashboard', to: '/mentor/dashboard' },
        { label: 'Learning Materials' },
      ]}
      actions={
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onOpenUploadModal}
          className="h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3.5"
        >
          <Plus className="size-3.5 sm:size-4 mr-1 sm:mr-1.5" />
          <span>Upload Material</span>
        </Button>
      }
    />
  )
}
