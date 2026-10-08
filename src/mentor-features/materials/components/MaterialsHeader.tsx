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
          onClick={onOpenUploadModal}
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          <span>Upload Material</span>
        </Button>
      }
    />
  )
}
