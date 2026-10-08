import { useState } from 'react'
import { CheckSquare, Plus, User, Clock, AlertCircle, X, Sparkles, Filter } from 'lucide-react'
import { Badge, Button, Input, Textarea, Label, Avatar } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { Project, ProjectTask, TaskStatus } from '../types/project.types'

interface ProjectTasksProps {
  project: Project
  onAddTask: (task: {
    title: string
    description: string
    assigneeId?: string
    dueDate?: string
  }) => void
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void
  currentUserId?: string
  currentUserRole?: 'student' | 'team_lead' | 'member' | 'mentor'
}

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; tone: 'neutral' | 'warning' | 'success' | 'destructive'; icon: React.ElementType }
> = {
  pending: { label: 'Pending', tone: 'neutral', icon: Clock },
  in_progress: { label: 'In Progress', tone: 'warning', icon: Sparkles },
  completed: { label: 'Completed', tone: 'success', icon: CheckSquare },
  rework: { label: 'Rework Required', tone: 'destructive', icon: AlertCircle },
}

export function ProjectTasks({
  project,
  onAddTask,
  onUpdateTaskStatus,
  currentUserId = 'STD-1001',
  currentUserRole = 'team_lead',
}: ProjectTasksProps) {
  const isGroup = project.projectType === 'group'

  // Permission Checks
  const canCreateTask =
    !isGroup || currentUserRole === 'team_lead' || currentUserRole === 'mentor'

  // Filters State
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'my'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')

  // Task Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>(
    project.team?.members[0]?.studentId || currentUserId,
  )
  const [taskDueDate, setTaskDueDate] = useState('2026-10-30')

  // Filter tasks
  const filteredTasks = project.tasks.filter((t) => {
    // Assignment Filter
    if (isGroup && assignmentFilter === 'my') {
      if (t.assignee?.studentId !== currentUserId) return false
    }

    // Status Filter
    if (statusFilter !== 'all') {
      if (t.status !== statusFilter) return false
    }

    return true
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    onAddTask({
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      assigneeId: isGroup ? selectedAssigneeId : currentUserId,
      dueDate: taskDueDate,
    })

    setTaskTitle('')
    setTaskDescription('')
    setIsModalOpen(false)
  }

  const canUserUpdateTask = (task: ProjectTask) => {
    if (currentUserRole === 'mentor' || currentUserRole === 'team_lead') return true
    if (task.assignee?.studentId === currentUserId) return true
    return false
  }

  return (
    <div className="rounded-md border border-border bg-surface p-5 shadow-sm space-y-4">
      {/* Header with Title & Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" /> Task Management ({project.tasks.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage splotches of work, update 4-state statuses (Pending, In Progress, Completed, Rework), and track team deliverables.
          </p>
        </div>

        {canCreateTask && (
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="text-xs font-bold shrink-0 self-start sm:self-auto"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add New Task
          </Button>
        )}
      </div>

      {/* Filter Controls (Assignment + Status) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border/60">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </span>

          {/* Group assignment filter toggle */}
          {isGroup && (
            <div className="flex items-center gap-1 bg-background border border-border rounded-md p-1 shadow-sm">
              <button
                onClick={() => setAssignmentFilter('all')}
                className={cn(
                  'px-2.5 py-1 text-xs font-bold rounded transition-all',
                  assignmentFilter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                All Tasks
              </button>
              <button
                onClick={() => setAssignmentFilter('my')}
                className={cn(
                  'px-2.5 py-1 text-xs font-bold rounded transition-all',
                  assignmentFilter === 'my'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                My Tasks
              </button>
            </div>
          )}

          {/* Status Filter buttons */}
          <div className="flex flex-wrap items-center gap-1 bg-background border border-border rounded-md p-1 shadow-sm">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-2 py-1 text-[11px] font-bold rounded transition-all',
                statusFilter === 'all'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              All Statuses
            </button>
            {(['pending', 'in_progress', 'completed', 'rework'] as TaskStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  'px-2 py-1 text-[11px] font-bold rounded transition-all capitalize',
                  statusFilter === st
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {STATUS_CONFIG[st].label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-muted-foreground font-semibold">
          Showing <span className="text-foreground font-bold">{filteredTasks.length}</span> tasks
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const statusInfo = STATUS_CONFIG[task.status]
          const isAllowedToUpdate = canUserUpdateTask(task)

          return (
            <div
              key={task.id}
              id={`task-item-${task.id}`}
              className={cn(
                'rounded-xl border p-4 transition-all space-y-3 bg-background',
                task.status === 'completed'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : task.status === 'rework'
                    ? 'border-destructive/30 bg-destructive/5'
                    : 'border-border/70 hover:border-border',
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground leading-snug">{task.title}</h4>
                    <Badge tone={statusInfo.tone} size="sm" className="font-semibold text-[10px]">
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* Status Dropdown / Segmented Control */}
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground">Status:</span>
                  <select
                    value={task.status}
                    disabled={!isAllowedToUpdate}
                    onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className={cn(
                      'rounded-md border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground shadow-xs transition-colors focus:outline-none focus:ring-1 focus:ring-primary',
                      !isAllowedToUpdate && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed (Submit)</option>
                    <option value="rework">Rework Required</option>
                  </select>
                </div>
              </div>

              {/* Task Meta Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Created By */}
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 text-primary" />
                    Created by: <strong className="text-foreground">{task.createdBy.name}</strong>
                  </span>

                  {/* Assignee */}
                  {task.assignee && (
                    <span className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded border border-border/50">
                      <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" />
                      <span>Assigned to: <strong className="text-foreground">{task.assignee.name}</strong></span>
                    </span>
                  )}
                </div>

                {/* Due Date */}
                {task.dueDate && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <Clock className="h-3 w-3" /> Due: {task.dueDate}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {filteredTasks.length === 0 && (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
            No tasks match the selected filters.
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Create New Task</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="task-title" className="text-xs font-bold">
                  Task Title *
                </Label>
                <Input
                  id="task-title"
                  placeholder="e.g. Build Zustand auth persistence & token refresh"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-desc" className="text-xs font-bold">
                  Description / Details *
                </Label>
                <Textarea
                  id="task-desc"
                  placeholder="Provide technical specifications, instructions, or acceptance criteria..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  required
                  className="text-xs resize-none"
                />
              </div>

              {isGroup && project.team && (
                <div className="space-y-1.5">
                  <Label htmlFor="task-assignee" className="text-xs font-bold">
                    Assign Team Member *
                  </Label>
                  <select
                    id="task-assignee"
                    value={selectedAssigneeId}
                    onChange={(e) => setSelectedAssigneeId(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {project.team.members.map((mem) => (
                      <option key={mem.studentId || mem.id} value={mem.studentId || mem.id}>
                        {mem.name} ({mem.role === 'team_lead' ? 'Team Lead' : 'Member'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="task-due" className="text-xs font-bold">
                  Due Date
                </Label>
                <Input
                  id="task-due"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs font-bold">
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
