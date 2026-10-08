import { useState } from 'react'
import { MessageSquare, Send, Sparkles, CheckCircle2, AlertTriangle, Star } from 'lucide-react'
import { Badge, Avatar, Button, Textarea } from '@/components/ui'
import type { ProjectComment } from '../types/project.types'

interface ProjectCommentsProps {
  comments: ProjectComment[]
  onAddComment?: (text: string) => void
  currentUserName?: string
  currentUserRole?: string
  currentUserAvatar?: string
}

export function ProjectComments({
  comments,
  onAddComment,
  currentUserName = 'Mohammed Sinan',
  currentUserRole = 'Student',
  currentUserAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
}: ProjectCommentsProps) {
  const [newCommentText, setNewCommentText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    onAddComment?.(newCommentText.trim())
    setNewCommentText('')
  }

  const getTagBadge = (statusTag?: ProjectComment['statusTag']) => {
    if (!statusTag) return null
    switch (statusTag) {
      case 'praise':
        return (
          <Badge tone="primary" className="text-[10px] font-semibold">
            <Sparkles className="mr-1 h-3 w-3" /> Excellent Work
          </Badge>
        )
      case 'approved':
        return (
          <Badge tone="success" className="text-[10px] font-semibold">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
          </Badge>
        )
      case 'changes_requested':
        return (
          <Badge tone="warning" className="text-[10px] font-semibold">
            <AlertTriangle className="mr-1 h-3 w-3" /> Revision Needed
          </Badge>
        )
      default:
        return (
          <Badge tone="neutral" size="sm" className="text-[10px]">
            Comment
          </Badge>
        )
    }
  }

  return (
    <div className="flex h-[550px] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {/* 1. Fixed Top Header */}
      <div className="backdrop-blur-xs shrink-0 border-b border-border bg-surface/95 p-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
          <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
          Project Discussion & Mentor Feedback ({comments.length})
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Collaborative discussion section for students, team members, team lead, and mentors.
        </p>
      </div>

      {/* 2. Middle Scrollable Comment List */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="space-y-2.5 rounded-xl border border-border/70 bg-background p-4 transition-all hover:border-border"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={comment.userName}
                    src={comment.userAvatar}
                    size="sm"
                    className="border border-border"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{comment.userName}</h4>
                    {comment.userRole && (
                      <p className="text-[11px] text-muted-foreground">{comment.userRole}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {comment.rating && (
                    <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                      {Array.from({ length: comment.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  )}
                  {getTagBadge(comment.statusTag)}
                  <span className="text-[11px] text-muted-foreground">{comment.date}</span>
                </div>
              </div>

              <p className="rounded-lg border border-border/40 bg-muted/30 p-3 text-xs leading-relaxed text-foreground/90">
                "{comment.text}"
              </p>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
            No comments yet in this project workspace. Start the discussion below!
          </div>
        )}
      </div>

      {/* 3. Bottom Pinned Add Comment Form (Auto-expanding 1-3 lines) */}
      {onAddComment && (
        <form
          onSubmit={handleSubmit}
          className="shrink-0 space-y-2 border-t border-border bg-muted/20 p-3"
        >
          {/* User Info Header */}
          <div className="flex items-center gap-2">
            <Avatar name={currentUserName} src={currentUserAvatar} size="xs" />

            <div className="flex min-w-0 flex-1 items-center justify-between">
              <span className="truncate text-xs font-bold text-foreground">{currentUserName}</span>

              <span className="text-[10px] text-muted-foreground">{currentUserRole}</span>
            </div>
          </div>

          {/* Comment Input */}
          <div className="flex items-end gap-2">
            <Textarea
              autoGrow
              minRows={1}
              maxRows={3}
              placeholder="Type your comment or update for the mentor & team..."
              value={newCommentText}
              onChange={(e) => {
                setNewCommentText(e.target.value)

                const textarea = e.target

                // Reset height first so it can shrink when text is deleted
                textarea.style.height = 'auto'

                // Grow based on content, max 3 rows
                const maxHeight = 80
                textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
              }}
              rows={1}
              className="max-h-[80px] min-h-[36px] flex-1 resize-none overflow-y-auto bg-background py-2 text-xs leading-[20px] transition-[height] duration-150 focus-visible:ring-1"
            />

            <Button
              type="submit"
              size="sm"
              disabled={!newCommentText.trim()}
              className="h-[36px] shrink-0 px-3 text-xs font-bold"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Post Comment
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

// Re-export as MentorComments for backward compatibility
export const MentorComments = ProjectComments
