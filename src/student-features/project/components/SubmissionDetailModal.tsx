import { FileText, GitBranch, ExternalLink, Award, CheckCircle2 } from 'lucide-react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Button,
  Badge,
} from '@/components/ui'
import type { Submission } from '../types/project.types'

interface SubmissionDetailModalProps {
  submission: Submission | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubmissionDetailModal({
  submission,
  open,
  onOpenChange,
}: SubmissionDetailModalProps) {
  if (!submission) return null

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="h-4 w-4" /> Submission Details
          </div>
          <ModalTitle className="text-lg font-bold">{submission.milestoneTitle}</ModalTitle>
          <ModalDescription className="text-xs">
            Submitted on {submission.submittedAt} by {submission.submittedBy}
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4 py-3 text-xs">
          {/* Status & Grade Banner */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3.5">
            <div>
              <span className="text-[11px] text-muted-foreground block">Review Status</span>
              <Badge tone="neutral" className="mt-1 font-semibold uppercase text-[10px]">
                {submission.status}
              </Badge>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-muted-foreground block">Score</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                <Award className="h-4 w-4 text-amber-500" />
                {submission.grade || 'Pending Grade'}
              </span>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-2">
            <span className="font-bold text-foreground block">Deliverable Links:</span>
            <div className="flex flex-col gap-2">
              {submission.repositoryLink && (
                <a
                  href={submission.repositoryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 hover:bg-muted/30 transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <GitBranch className="h-4 w-4 text-primary" /> Repository Code
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              )}

              {submission.demoLink && (
                <a
                  href={submission.demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 hover:bg-muted/30 transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <ExternalLink className="h-4 w-4 text-primary" /> Live Staging Preview
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              )}
            </div>
          </div>

          {/* Submission Notes */}
          <div className="space-y-1">
            <span className="font-bold text-foreground block">Developer Notes:</span>
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-muted-foreground leading-relaxed">
              {submission.notes}
            </div>
          </div>

          {/* Mentor Summary Feedback */}
          {submission.feedbackSummary && (
            <div className="space-y-1">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Mentor Feedback Summary:
              </span>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                "{submission.feedbackSummary}"
              </div>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs w-full"
          >
            Close Window
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
