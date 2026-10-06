import type { Task } from '@/types'
import { bucketOf } from './followup-buckets'

export const TASK_GROUP_IDS = ['overdue', 'today', 'upcoming', 'undated', 'done'] as const
export type TaskGroupId = (typeof TASK_GROUP_IDS)[number]

export const TASK_GROUP_LABEL: Record<TaskGroupId, string> = {
  overdue: 'Overdue',
  today: 'Today',
  upcoming: 'Upcoming',
  undated: 'No due date',
  done: 'Completed',
}

export function taskGroupOf(task: Pick<Task, 'dueAt' | 'status'>, now: Date): TaskGroupId {
  if (task.status === 'done') return 'done'
  if (!task.dueAt) return 'undated'
  const bucket = bucketOf(task.dueAt, now)
  if (bucket === 'overdue') return 'overdue'
  if (bucket === 'today') return 'today'
  return 'upcoming'
}

export function groupTasks(tasks: readonly Task[], now: Date): Record<TaskGroupId, Task[]> {
  const groups: Record<TaskGroupId, Task[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    undated: [],
    done: [],
  }
  for (const task of tasks) groups[taskGroupOf(task, now)].push(task)
  for (const id of TASK_GROUP_IDS) {
    groups[id].sort((a, b) => (a.dueAt ?? '9999').localeCompare(b.dueAt ?? '9999'))
  }
  return groups
}
