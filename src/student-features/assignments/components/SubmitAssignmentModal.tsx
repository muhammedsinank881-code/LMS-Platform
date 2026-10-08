import { useState } from 'react'
import { Calendar, Check, Code, Send, Upload } from 'lucide-react'
import { Avatar, Badge, Button, Input, Modal, ModalBody, ModalContent, ModalDescription, ModalHeader, ModalTitle, Textarea } from '@/components/ui'
import type { StudentTask } from '../data/assignmentsData'

interface SubmitAssignmentModalProps {
  task: StudentTask | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (taskId: string, repoUrl: string, notes: string) => void
}

export function SubmitAssignmentModal({
  task,
  open,
  onOpenChange,
  onSubmit,
}: SubmitAssignmentModalProps) {
  const [repoUrl, setRepoUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)

  if (!task) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(task.id, repoUrl, notes)
    setRepoUrl('')
    setNotes('')
    setFileName(null)
  }

  const handleSimulateFileUpload = () => {
    setFileName(`${task.id}-solution.zip (2.4 MB)`)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md" className="max-h-[90vh] flex flex-col">
        <ModalHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary-subtle px-2 py-0.5 text-xs font-bold text-primary font-mono">
              {task.courseCode}
            </span>
            <Badge tone="neutral" appearance="soft" size="sm" className="text-[11px]">
              {task.course}
            </Badge>
          </div>

          <ModalTitle className="text-xl font-bold text-foreground mt-1">
            Submit: {task.title}
          </ModalTitle>

          <ModalDescription className="text-xs text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Due: {task.dueDate}
            </span>
            <span>•</span>
            <span className="font-semibold text-foreground">{task.points} Points</span>
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <ModalBody className="space-y-4 py-4 text-xs">
            {/* Mentor & Instructions */}
            <div className="rounded-lg bg-surface-hover p-3 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Task Overview & Requirements</span>
                <div className="flex items-center gap-1.5">
                  <Avatar name={task.mentorName} src={task.mentorAvatar} size="xs" />
                  <span className="text-[11px] text-muted-foreground">{task.mentorName}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-[11px]">{task.description}</p>
              {task.instructions && task.instructions.length > 0 && (
                <div className="pt-1 space-y-1">
                  <p className="font-semibold text-foreground text-[11px]">Instructions:</p>
                  <ul className="list-disc list-inside text-muted-foreground text-[11px] space-y-0.5">
                    {task.instructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label htmlFor="submit-repo-url" className="block text-xs font-semibold text-foreground mb-1">
                  GitHub Repository / Deployment Link (Optional)
                </label>
                <div className="relative">
                  <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="submit-repo-url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/your-username/repository"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="submit-notes" className="block text-xs font-semibold text-foreground mb-1">
                  Submission Notes & Remarks
                </label>
                <Textarea
                  id="submit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your solution, component choices, testing approach..."
                  rows={3}
                  className="text-xs"
                />
              </div>

              {/* File Attachment Upload */}
              <div>
                <label htmlFor="file-upload-btn" className="block text-xs font-semibold text-foreground mb-1">
                  Attach Solution File / Project ZIP
                </label>
                <button
                  id="file-upload-btn"
                  type="button"
                  onClick={handleSimulateFileUpload}
                  className="w-full cursor-pointer rounded-lg border border-dashed border-border p-4 text-center hover:bg-surface-hover transition-colors"
                >
                  {fileName ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
                      <Check className="h-4 w-4" /> {fileName}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground font-medium">
                        Click to attach ZIP or code files (Max 25MB)
                      </p>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                className="gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="h-3.5 w-3.5" /> Submit Task Solution
              </Button>
            </div>
          </ModalBody>
        </form>
      </ModalContent>
    </Modal>
  )
}
