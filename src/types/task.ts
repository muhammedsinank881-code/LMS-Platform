import type { ListParams, Priority, TenantOwned } from './common'
import type { DealId, LeadId, TaskId, UserId } from './ids'

export const TASK_STATUSES = ['open', 'in_progress', 'done', 'overdue'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface Task extends TenantOwned {
  id: TaskId
  title: string
  description: string
  /** Null when the task has no due date. */
  dueAt: string | null
  priority: Priority
  assigneeId: UserId
  /** `overdue` is derived on read (not done and past due), never stored. */
  status: TaskStatus
  reminderAt: string | null
  leadId: LeadId | null
  dealId: DealId | null
  completedAt: string | null
  createdBy: UserId | null
  createdAt: string
}

export type TaskFilterField =
  'assigneeId' | 'status' | 'priority' | 'dueAt' | 'leadId' | 'dealId' | 'bucket'
export type TaskListParams = ListParams<TaskFilterField>
