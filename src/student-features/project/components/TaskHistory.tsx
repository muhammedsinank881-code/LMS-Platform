import { History, CheckCircle2, User, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { ProjectTask } from '../types/project.types'

interface TaskHistoryProps {
  tasks: ProjectTask[]
  onSelectTask?: (taskId: string) => void
}

export function TaskHistory({ tasks, onSelectTask }: TaskHistoryProps) {
  // Only display completed tasks in history
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="rounded-md border border-border bg-surface p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary shrink-0" />
          <h3 className="text-base font-bold text-foreground">Task Completion History</h3>
        </div>
        <Badge tone="success" className="font-semibold text-xs">
          {completedTasks.length} Completed
        </Badge>
      </div>

      {completedTasks.length > 0 ? (
        <div className="divide-y divide-border/60">
          {completedTasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask?.(task.id)}
              className="w-full text-left group flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/30 px-2 rounded-lg cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {task.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 text-xs">
                {/* Completed Date */}
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Completed: <span className="text-foreground">{task.completedAt || 'Recently'}</span>
                </span>

                {/* Created By */}
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <User className="h-3 w-3 text-primary" />
                  <span>{task.createdBy.name}</span>
                </div>

                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-muted-foreground">
          No completed tasks in history yet. When tasks are marked Completed, they will appear here.
        </div>
      )}
    </div>
  )
}
