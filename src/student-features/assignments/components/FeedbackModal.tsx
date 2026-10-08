import { Calendar, Code, ExternalLink, FileText, MessageSquare } from 'lucide-react'
import { Avatar, Badge, Button, Modal, ModalBody, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '@/components/ui'
import type { StudentTask } from '../data/assignmentsData'

interface FeedbackModalProps {
  task: StudentTask | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackModal({ task, open, onOpenChange }: FeedbackModalProps) {
  if (!task) return null

  const isGraded = task.status === 'graded'

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md" className="max-h-[85vh] flex flex-col">
        <ModalHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary-subtle px-2 py-0.5 text-xs font-bold text-primary font-mono">
                {task.courseCode}
              </span>
              <Badge tone="neutral" appearance="soft" size="sm" className="text-[11px]">
                {task.course}
              </Badge>
            </div>

            {isGraded ? (
              <Badge tone="success" appearance="solid" size="md" className="font-bold text-xs">
                Grade: {task.score}
              </Badge>
            ) : (
              <Badge tone="info" appearance="soft" size="md" className="font-medium text-xs">
                Under Mentor Review
              </Badge>
            )}
          </div>

          <ModalTitle className="text-xl font-bold text-foreground mt-1">
            {task.title}
          </ModalTitle>

          <ModalDescription className="text-xs text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Submitted: {task.submittedAt || 'Recently'}
            </span>
            <span>•</span>
            <span>{task.points} Total Points</span>
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4 overflow-y-auto py-4 text-xs">
          {/* Mentor Feedback Box */}
          <div className="rounded-xl border border-primary/20 bg-primary-subtle/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar name={task.mentorName} src={task.mentorAvatar} size="xs" />
                <div>
                  <p className="font-bold text-foreground text-xs">{task.mentorName}</p>
                  <p className="text-[10px] text-muted-foreground">Assigned Mentor</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                <MessageSquare className="h-3.5 w-3.5" /> Mentor Review
              </span>
            </div>

            <p className="text-foreground text-xs leading-relaxed pt-1">
              {task.feedbackNotes ||
                'Your submission has been received successfully and is currently queued for detailed code review and feedback by your assigned mentor.'}
            </p>
          </div>

          {/* Submitted Work Details */}
          <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> Submitted Details
            </h4>

            {task.submittedRepoUrl && (
              <div className="flex items-center justify-between rounded-md bg-surface-hover p-2.5 border border-border/60">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Code className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate text-xs font-mono font-medium text-foreground">
                    {task.submittedRepoUrl}
                  </span>
                </div>
                <a
                  href={task.submittedRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
                >
                  View Repo <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {task.submittedNotes && (
              <div className="space-y-1">
                <span className="font-semibold text-foreground text-[11px]">Submission Notes:</span>
                <p className="text-muted-foreground bg-surface-hover p-2.5 rounded-md text-[11px]">
                  {task.submittedNotes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full text-xs font-semibold"
            >
              Close Details
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
