import { Avatar } from '@/components/ui'
import type { StudentTask } from '../data/assignmentsData'

interface TaskOverviewProps {
  task: StudentTask
}

export function TaskOverview({ task }: TaskOverviewProps) {
  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-surface-hover p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-foreground">Task Overview & Requirements</span>
        <div className="flex shrink-0 items-center gap-1.5">
          <Avatar name={task.mentorName} src={task.mentorAvatar} size="xs" />
          <span className="text-[11px] text-muted-foreground">{task.mentorName}</span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">{task.description}</p>
      {task.instructions && task.instructions.length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="text-[11px] font-semibold text-foreground">Instructions:</p>
          <ul className="list-inside list-disc space-y-0.5 text-[11px] text-muted-foreground">
            {task.instructions.map((instruction, index) => (
              <li key={`${task.id}-instruction-${index}`}>{instruction}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
