import { AlertCircle, Award, Calendar, FileText, Send } from 'lucide-react'
import { Avatar, Badge, Button, Card } from '@/components/ui'
import type { StudentTask } from '../data/assignmentsData'

interface AssignmentCardProps {
  task: StudentTask
  onOpenSubmit: (task: StudentTask) => void
  onOpenFeedback: (task: StudentTask) => void
}

export function AssignmentCard({ task, onOpenSubmit, onOpenFeedback }: AssignmentCardProps) {
  const isPending = task.status === 'pending'
  const isSubmitted = task.status === 'submitted'
  const isGraded = task.status === 'graded'

  return (
    <Card className="group flex flex-col justify-between overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-md p-4">
      {/* Header: Course Code, Title & Due Tag */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary-subtle px-2 py-0.5 text-[11px] font-bold text-primary font-mono">
              {task.courseCode}
            </span>
            <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
              Assignment
            </Badge>
          </div>

          {task.isDueToday && isPending && (
            <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500 animate-pulse border border-rose-500/20">
              <AlertCircle className="h-3 w-3" /> Due Today
            </span>
          )}

          {isSubmitted && (
            <Badge tone="info" appearance="soft" size="sm" className="text-[10px]">
              Submitted
            </Badge>
          )}

          {isGraded && (
            <Badge tone="success" appearance="solid" size="sm" className="text-[10px]">
              ✓ Graded
            </Badge>
          )}
        </div>

        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {task.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      </div>

      {/* Body: Course, Due Date, Points & Mentor */}
      <div className="mt-4 space-y-3 pt-3 border-t border-border/50 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Calendar className="h-3.5 w-3.5 text-primary" /> {task.dueDate}
          </span>
          <span className="font-semibold text-foreground text-[11px]">
            {task.points} pts
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground truncate max-w-[140px]">{task.course}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Avatar name={task.mentorName} src={task.mentorAvatar} size="xs" />
            <span className="font-medium text-foreground">{task.mentorName}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {isPending ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onOpenSubmit(task)}
              className="w-full gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="h-3.5 w-3.5" /> Submit Task
            </Button>
          ) : isSubmitted ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenFeedback(task)}
              className="w-full gap-2 text-xs font-semibold"
            >
              <FileText className="h-3.5 w-3.5" /> View Submission
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => onOpenFeedback(task)}
                className="w-full gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Award className="h-3.5 w-3.5" /> Grade: {task.score}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
