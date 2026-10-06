import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { TASK_GROUP_IDS, TASK_GROUP_LABEL, type TaskGroupId } from '@/lib/task-groups'
import type { Task } from '@/types'
import { TaskRow } from './TaskRow'

export function TaskGroups({
  groups,
  now,
  leadName,
  assignee,
  selected,
  onSelectedChange,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  groups: Record<TaskGroupId, Task[]>
  now: Date
  leadName: (id: string) => string | null
  assignee: (id: string) => { name: string; avatar?: string | null } | null
  selected: Set<string>
  onSelectedChange: (id: string, checked: boolean) => void
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDuplicate: (task: Task) => void
  onDelete: (task: Task) => void
}) {
  const [closed, setClosed] = useState<Partial<Record<TaskGroupId, boolean>>>({ done: true })
  return (
    <div className="space-y-2">
      {TASK_GROUP_IDS.map((id) => {
        const items = groups[id]
        if (items.length === 0) return null
        const open = !closed[id]
        return (
          <section key={id} aria-label={TASK_GROUP_LABEL[id]}>
            <button
              type="button"
              aria-expanded={open}
              className="sticky top-0 z-10 flex w-full items-center gap-2 bg-background py-1 text-sm font-medium"
              onClick={() => setClosed((current) => ({ ...current, [id]: open }))}
            >
              <ChevronDown className={cn('h-4 w-4', !open && '-rotate-90')} />
              {TASK_GROUP_LABEL[id]}
              <span className="text-muted-foreground">{items.length}</span>
            </button>
            {open ? (
              <div className="flex flex-col gap-1">
                {items.map((task) => {
                  const person = assignee(task.assigneeId)
                  return (
                    <TaskRow
                      key={task.id}
                        task={task}
                        now={now}
                        leadName={task.leadId ? leadName(task.leadId) : null}
                        assigneeName={person?.name}
                        assigneeAvatar={person?.avatar}
                        selected={selected.has(task.id)}
                        onSelectedChange={(checked) => onSelectedChange(task.id, checked)}
                        onToggle={() => onToggle(task)}
                        onEdit={() => onEdit(task)}
                        onDuplicate={() => onDuplicate(task)}
                        onDelete={() => onDelete(task)}
                    />
                  )
                })}
              </div>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
