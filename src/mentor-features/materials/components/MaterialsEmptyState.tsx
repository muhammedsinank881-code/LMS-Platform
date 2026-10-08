import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'

interface MaterialsEmptyStateProps {
  onUpload: () => void
}

export function MaterialsEmptyState({ onUpload }: MaterialsEmptyStateProps) {
  return (
    <div className="py-12 bg-surface rounded-lg border border-border">
      <EmptyState
        icon={FileText}
        title="No learning materials yet"
        description="Upload notes or video classes to make them available to your students."
        action={
          <Button type="button" variant="primary" onClick={onUpload} className="flex items-center gap-2">
            <Plus className="size-4" />
            <span>Upload Material</span>
          </Button>
        }
      />
    </div>
  )
}
