import { useState } from 'react'
import { Upload, GitBranch, ExternalLink, FileText, CheckCircle2 } from 'lucide-react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Label,
} from '@/components/ui'
import type { ProjectMilestone, SubmitMilestoneFormData } from '../types/project.types'

interface SubmitMilestoneModalProps {
  milestone: ProjectMilestone | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: SubmitMilestoneFormData) => void
}

export function SubmitMilestoneModal({
  milestone,
  open,
  onOpenChange,
  onSubmit,
}: SubmitMilestoneModalProps) {
  const [repositoryLink, setRepositoryLink] = useState('')
  const [demoLink, setDemoLink] = useState('')
  const [notes, setNotes] = useState('')
  const [attachments, setAttachments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!milestone) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      onSubmit({
        milestoneId: milestone.id,
        repositoryLink,
        demoLink,
        notes,
        attachments,
      })
      setIsSubmitting(false)
      setRepositoryLink('')
      setDemoLink('')
      setNotes('')
      setAttachments('')
    }, 400)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
              <Upload className="h-4 w-4" /> Submit Milestone {milestone.milestoneNumber}
            </div>
            <ModalTitle className="text-xl font-bold">{milestone.title}</ModalTitle>
            <ModalDescription className="text-xs">
              Upload repository links, live preview URL, and release notes for mentor review.
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* Required Deliverable Reminder */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <span className="font-bold text-foreground block mb-0.5">Required Deliverable:</span>
              <p className="text-muted-foreground">{milestone.deliverableFormat}</p>
            </div>

            {/* GitHub Repo Input */}
            <div className="space-y-1.5">
              <Label htmlFor="repo-link" className="text-xs font-semibold flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-primary" /> Repository Link (GitHub / GitLab) *
              </Label>
              <Input
                id="repo-link"
                placeholder="https://github.com/leadflow-org/project-repo/pull/1"
                value={repositoryLink}
                onChange={(e) => setRepositoryLink(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Live Demo Link */}
            <div className="space-y-1.5">
              <Label htmlFor="demo-link" className="text-xs font-semibold flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-primary" /> Live Staging / Demo URL *
              </Label>
              <Input
                id="demo-link"
                placeholder="https://my-capstone.vercel.app"
                value={demoLink}
                onChange={(e) => setDemoLink(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Submission Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" /> Developer Notes & Summary *
              </Label>
              <Textarea
                id="notes"
                placeholder="Summarize key completed requirements, architectural decisions, and testing steps..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                required
                className="text-xs resize-none"
              />
            </div>

            {/* Additional Artifact Link */}
            <div className="space-y-1.5">
              <Label htmlFor="artifacts" className="text-xs font-semibold">
                Additional Artifact Link / Video Demo (Optional)
              </Label>
              <Input
                id="artifacts"
                placeholder="https://loom.com/share/your-demo-video"
                value={attachments}
                onChange={(e) => setAttachments(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <ModalFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs font-bold">
              {isSubmitting ? (
                'Submitting Deliverable...'
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Submit for Review
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
