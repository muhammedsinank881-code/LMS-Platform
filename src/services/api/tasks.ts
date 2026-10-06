import type { CreateTaskInput, Task, TaskId, TaskListParams, UpdateTaskInput } from '@/types'
import type { CrudClient } from './resource'

export interface TasksApiClient extends CrudClient<
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskListParams,
  TaskId
> {
  complete(id: TaskId): Promise<Task>
  reopen(id: TaskId): Promise<Task>
}
