import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { AssigneeField } from '@/features/followups/components/AssigneeField'
import { LeadPicker } from '@/features/followups/components/LeadPicker'
import { REMINDER_OPTIONS } from '@/features/followups/type-meta'
import { Button, DatePicker, Input, Select, Textarea, TimePicker } from '@/components/ui'
import { PRIORITIES } from '@/types'
import { splitDueAt } from '@/lib/followup-schedule'
import { taskFormSchema, type TaskFormValues } from '../schemas'
import type { Task } from '@/types'

function fromTask(task: Task | null, assigneeId: string, leadId?: string): TaskFormValues {
  const due = task?.dueAt ? splitDueAt(task.dueAt) : { date: '', time: '' }
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    date: due.date,
    time: due.time,
    priority: task?.priority ?? 'medium',
    assigneeId: task?.assigneeId ?? assigneeId,
    reminder: 'none',
    leadId: task?.leadId ?? leadId ?? '',
    dealId: task?.dealId ?? '',
    status: task && task.status !== 'overdue' ? task.status : 'open',
  }
}

export function TaskForm({
  task,
  assigneeId,
  leadId,
  lockLead,
  leadLabel,
  deals,
  submitting,
  onSubmit,
  onCancel,
}: {
  task?: Task | null
  assigneeId: string
  leadId?: string
  lockLead?: boolean
  leadLabel?: string
  deals: Array<{ id: string; label: string }>
  submitting?: boolean
  onSubmit: (values: TaskFormValues) => Promise<void>
  onCancel: () => void
}) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: fromTask(task ?? null, assigneeId, leadId),
  })
  const { errors } = form.formState
  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values)
      })}
    >
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-2">
        <FormField id="task-title" label="Title" required error={errors.title?.message}>
          {(control) => (
            <Input id={control.id} invalid={control.invalid} aria-describedby={control['aria-describedby']} {...form.register('title')} />
          )}
        </FormField>
        <FormField id="task-description" label="Description" error={errors.description?.message}>
          {(control) => (
            <Textarea id={control.id} rows={3} invalid={control.invalid} {...form.register('description')} />
          )}
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="task-date" label="Due date" error={errors.date?.message}>
            {(control) => (
              <DatePicker id={control.id} value={form.watch('date') ?? ''} onValueChange={(value) => form.setValue('date', value)} />
            )}
          </FormField>
          <FormField id="task-time" label="Time" error={errors.time?.message}>
            {(control) => (
              <TimePicker id={control.id} value={form.watch('time') ?? ''} onValueChange={(value) => form.setValue('time', value)} />
            )}
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="task-priority" label="Priority" required>
            {(control) => (
              <Select
                id={control.id}
                value={form.watch('priority')}
                onValueChange={(value) => form.setValue('priority', value as TaskFormValues['priority'])}
                options={PRIORITIES.map((priority) => ({ value: priority, label: priority }))}
              />
            )}
          </FormField>
          <FormField id="task-reminder" label="Reminder">
            {(control) => (
              <Select
                id={control.id}
                value={form.watch('reminder')}
                onValueChange={(value) => form.setValue('reminder', value as TaskFormValues['reminder'])}
                options={REMINDER_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              />
            )}
          </FormField>
        </div>
        <AssigneeField
          id="task-assignee"
          resource="tasks"
          value={form.watch('assigneeId')}
          error={errors.assigneeId?.message}
          onChange={(userId) => form.setValue('assigneeId', userId)}
        />
        <FormField id="task-lead" label="Related lead">
          {(control) => (
            <LeadPicker
              id={control.id}
              value={form.watch('leadId') ?? ''}
              locked={lockLead}
              lockedLabel={leadLabel}
              onChange={(id) => form.setValue('leadId', id)}
            />
          )}
        </FormField>
        <FormField id="task-deal" label="Related deal">
          {(control) => (
            <Select
              id={control.id}
              value={form.watch('dealId') || 'none'}
              onValueChange={(value) => form.setValue('dealId', value === 'none' ? '' : value)}
              options={[{ value: 'none', label: 'No deal' }, ...deals.map((deal) => ({ value: deal.id, label: deal.label }))]}
            />
          )}
        </FormField>
        {task ? (
          <FormField id="task-status" label="Status">
            {(control) => (
              <Select
                id={control.id}
                value={form.watch('status') ?? 'open'}
                onValueChange={(value) => form.setValue('status', value as TaskFormValues['status'])}
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'in_progress', label: 'In progress' },
                  { value: 'done', label: 'Done' },
                ]}
              />
            )}
          </FormField>
        ) : null}
      </div>
      <div className="flex justify-end gap-2 border-t border-border p-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={submitting}>{task ? 'Save' : 'Create task'}</Button>
      </div>
    </form>
  )
}
