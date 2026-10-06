import { Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { Avatar, Button, Checkbox, Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import { overdueLabel } from '@/lib/overdue-label'
import { usePermission } from '@/hooks/use-permission'
import type { Task } from '@/types'

export function TaskRow({
  task,
  leadName,
  assigneeName,
  assigneeAvatar,
  now,
  selected,
  onSelectedChange,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  task: Task
  leadName?: string | null
  assigneeName?: string | null
  assigneeAvatar?: string | null
  now: Date
  selected?: boolean
  onSelectedChange?: (checked: boolean) => void
  onToggle: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const { can } = usePermission()
  const late = task.status !== 'done' ? overdueLabel(task.dueAt, now) : null
  return (
    <article className={cn('flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1.5', late && 'border-destructive/40')}>
      {onSelectedChange ? (
        <Checkbox size="sm" checked={selected} aria-label={`Select ${task.title}`} onCheckedChange={(value) => onSelectedChange(value === true)} />
      ) : null}
      <Checkbox
        checked={task.status === 'done'}
        aria-label={`Mark ${task.title} ${task.status === 'done' ? 'open' : 'done'}`}
        disabled={!can('tasks', 'edit')}
        onCheckedChange={onToggle}
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className={cn('min-w-0 truncate text-sm font-medium', task.status === 'done' && 'text-muted-foreground line-through')}>{task.title}</p>
          {task.leadId && leadName ? (
            <Link to={`/leads/${task.leadId}`} className="hidden max-w-32 shrink-0 truncate rounded-full border border-border px-2 py-0.5 text-xs text-primary hover:underline sm:inline">
              {leadName}
            </Link>
          ) : null}
          <span className={cn('ml-auto hidden shrink-0 whitespace-nowrap text-xs text-muted-foreground lg:inline', late && 'text-destructive')}>
            {task.dueAt ? formatDateTime(task.dueAt) : 'No due date'}
            {late ? ` · ${late}` : ''}
          </span>
        </div>
        <p className={cn('truncate text-xs text-muted-foreground lg:hidden', late && 'text-destructive')}>
          {task.dueAt ? formatDateTime(task.dueAt) : 'No due date'}
          {late ? ` · ${late}` : ''}
          {task.leadId && leadName ? ` · ${leadName}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        {assigneeName ? <Avatar name={assigneeName} src={assigneeAvatar} size="xs" /> : null}
        <Dropdown>
          <DropdownTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${task.title}`}>
              <MoreHorizontal />
            </Button>
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownItem disabled={!can('tasks', 'edit')} onSelect={onEdit}>
              <Pencil /> Edit
            </DropdownItem>
            <DropdownItem disabled={!can('tasks', 'create')} onSelect={onDuplicate}>
              <Copy /> Duplicate
            </DropdownItem>
            <DropdownItem destructive disabled={!can('tasks', 'delete')} onSelect={onDelete}>
              <Trash2 /> Delete
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </article>
  )
}
