import { bucketOf } from '@/lib/followup-buckets'
import type { TasksApiClient } from '@/services/api/tasks'
import {
  createTaskSchema,
  toTaskId,
  updateTaskSchema,
  type Task,
  type TaskFilterField,
  type TaskId,
} from '@/types'
import { request, type RequestContext } from '../core/context'
import { applyListParams, propertyValue, type ListSpec } from '../core/list-engine'
import { recordAudit } from '../core/records'
import { parseInput, validationError } from '../core/validate'

const FIELDS: readonly TaskFilterField[] = [
  'assigneeId',
  'status',
  'priority',
  'dueAt',
  'leadId',
  'dealId',
  'bucket',
]

/** `overdue` is derived: anything not done, dated, and past due. */
const withStatus = (ctx: RequestContext, task: Task): Task =>
  task.status !== 'done' && task.dueAt !== null && Date.parse(task.dueAt) < ctx.now.getTime()
    ? { ...task, status: 'overdue' }
    : task

function spec(ctx: RequestContext): ListSpec<Task, TaskFilterField> {
  return {
    fields: FIELDS,
    value(task, field) {
      if (field === 'status') return withStatus(ctx, task).status
      if (field === 'bucket') {
        if (task.status === 'done' || task.dueAt === null) return 'none'
        return bucketOf(task.dueAt, ctx.now)
      }
      return propertyValue(task, field)
    },
    searchable: (task) => [task.id, task.title, task.description],
    defaultSort: [{ field: 'dueAt', direction: 'asc' }],
    now: ctx.now,
  }
}

const owners = (task: Task) => [task.assigneeId, task.createdBy]

function requireTask(ctx: RequestContext, id: string, action: 'view' | 'edit' | 'delete'): Task {
  ctx.require('tasks', action)
  const task = ctx.db.get('tasks', id, 'Task')
  ctx.assertInScope('tasks', ...owners(task))
  return task
}

function assertAssignee(ctx: RequestContext, assigneeId: string): void {
  if (assigneeId !== ctx.actor.id) ctx.require('tasks', 'assign')
  if (!ctx.db.find('users', assigneeId))
    throw validationError('assigneeId', 'Select a valid assignee.')
}

function assertLinks(ctx: RequestContext, leadId?: string | null, dealId?: string | null): void {
  if (leadId && !ctx.db.find('leads', leadId))
    throw validationError('leadId', 'Select a valid lead.')
  if (dealId && !ctx.db.find('deals', dealId))
    throw validationError('dealId', 'Select a valid deal.')
}

function setDone(ctx: RequestContext, task: Task, done: boolean): Task {
  const status = done ? 'done' : 'open'
  if (task.status === status) return task
  const saved = ctx.db.save('tasks', {
    ...task,
    status,
    completedAt: done ? ctx.timestamp : null,
  })
  recordAudit(ctx, {
    action: 'updated',
    entity: 'task',
    entityId: saved.id,
    entityLabel: saved.title,
    previousValue: { status: task.status },
    newValue: { status },
  })
  return saved
}

export function createTaskRecord(ctx: RequestContext, raw: unknown): Task {
  ctx.require('tasks', 'create')
  const input = parseInput(createTaskSchema, raw)
  const assigneeId = input.assigneeId ?? ctx.actor.id
  assertAssignee(ctx, assigneeId)
  assertLinks(ctx, input.leadId, input.dealId)
  const task = ctx.db.insert('tasks', {
    id: toTaskId(ctx.db.nextNumber('task')),
    title: input.title,
    description: input.description?.trim() ?? '',
    dueAt: input.dueAt ? new Date(input.dueAt).toISOString() : null,
    priority: input.priority,
    assigneeId,
    status: 'open',
    reminderAt: input.reminderAt ? new Date(input.reminderAt).toISOString() : null,
    leadId: input.leadId ?? null,
    dealId: input.dealId ?? null,
    completedAt: null,
    createdBy: ctx.actor.id,
    createdAt: ctx.timestamp,
  })
  recordAudit(ctx, {
    action: 'created',
    entity: 'task',
    entityId: task.id,
    entityLabel: task.title,
    newValue: { dueAt: task.dueAt },
  })
  return task
}

export const mockTasksApi: TasksApiClient = {
  list: (params) =>
    request((ctx) => {
      ctx.require('tasks', 'view')
      const tasks = ctx.db
        .all('tasks')
        .filter((task) => ctx.inScope('tasks', ...owners(task)))
        .map((task) => withStatus(ctx, task))
      return applyListParams(tasks, params, spec(ctx), 'tasks')
    }),
  get: (id) => request((ctx) => withStatus(ctx, requireTask(ctx, id, 'view'))),
  create: (raw) => request((ctx) => createTaskRecord(ctx, raw)),
  update: (id, patch) =>
    request((ctx) => {
      const task = requireTask(ctx, id, 'edit')
      const input = parseInput(updateTaskSchema, patch)
      if (input.assigneeId && input.assigneeId !== task.assigneeId)
        assertAssignee(ctx, input.assigneeId)
      assertLinks(ctx, input.leadId, input.dealId)
      const status = input.status ?? (task.status === 'overdue' ? 'open' : task.status)
      const saved = ctx.db.save('tasks', {
        ...task,
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && { description: input.description?.trim() ?? '' }),
        ...(input.dueAt !== undefined && { dueAt: input.dueAt ? new Date(input.dueAt).toISOString() : null }),
        ...(input.priority && { priority: input.priority }),
        ...(input.assigneeId && { assigneeId: input.assigneeId }),
        ...(input.reminderAt !== undefined && {
          reminderAt: input.reminderAt ? new Date(input.reminderAt).toISOString() : null,
        }),
        ...(input.leadId !== undefined && { leadId: input.leadId ?? null }),
        ...(input.dealId !== undefined && { dealId: input.dealId ?? null }),
        status,
        completedAt: status === 'done' ? (task.completedAt ?? ctx.timestamp) : null,
      })
      return withStatus(ctx, saved)
    }),
  delete: (id) =>
    request((ctx) => {
      const task = requireTask(ctx, id, 'delete')
      ctx.db.remove('tasks', id)
      recordAudit(ctx, { action: 'deleted', entity: 'task', entityId: id, entityLabel: task.title })
    }),
  complete: (id: TaskId) => request((ctx) => setDone(ctx, requireTask(ctx, id, 'edit'), true)),
  reopen: (id: TaskId) =>
    request((ctx) => withStatus(ctx, setDone(ctx, requireTask(ctx, id, 'edit'), false))),
}
