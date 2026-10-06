import { useState } from 'react'
import { Button, EmptyState, Skeleton, toast } from '@/components/ui'
import { RoleGate } from '@/components/common/RoleGate'
import { CompleteFollowUpDialog } from '@/features/followups/components/CompleteFollowUpDialog'
import { FollowUpItem } from '@/features/followups/components/FollowUpItem'
import { RescheduleDialog } from '@/features/followups/components/RescheduleDialog'
import { useCompleteFollowUp, useRescheduleFollowUp, useSnoozeFollowUp } from '@/features/followups/hooks/use-followup-mutations'
import { useFollowUps } from '@/features/followups/hooks/use-followups'
import { TaskDialog } from '@/features/tasks/components/TaskDialog'
import { TaskRow } from '@/features/tasks/components/TaskRow'
import { useCompleteTask, useCreateTask, useDeleteTask, useReopenTask, useTasks, useUpdateTask } from '@/features/tasks/hooks/use-tasks'
import { toCreateTaskInput, type TaskFormValues } from '@/features/tasks/schemas'
import { useDeals } from '@/features/deals/hooks/use-deals'
import { useAuthStore } from '@/store/auth-store'
import { useUiStore } from '@/store/ui-store'
import type { FollowUp, Lead, Task } from '@/types'
import { userById, type LeadLookups } from '../../../types'

export function FollowUpsTab({ lead, lookups }: { lead: Lead; lookups: LeadLookups }) {
  const followUps = useFollowUps({
    filters: [{ field: 'leadId', operator: 'equals', value: lead.id }],
    pageSize: 50,
  })
  const tasks = useTasks({
    filters: [{ field: 'leadId', operator: 'equals', value: lead.id }],
    pageSize: 50,
  })
  const deals = useDeals({ filters: [{ field: 'leadId', operator: 'equals', value: lead.id }], pageSize: 20 })
  const openFollowUp = useUiStore((state) => state.openFollowUp)
  const userId = useAuthStore((state) => state.user?.id ?? '')
  const complete = useCompleteFollowUp()
  const reschedule = useRescheduleFollowUp()
  const snooze = useSnoozeFollowUp()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const completeTask = useCompleteTask()
  const reopenTask = useReopenTask()
  const [target, setTarget] = useState<FollowUp | null>(null)
  const [dialog, setDialog] = useState<'complete' | 'reschedule' | null>(null)
  const [taskEditor, setTaskEditor] = useState<Task | 'new' | null>(null)
  const now = new Date()
  const loading = followUps.isLoading || tasks.isLoading
  const error = followUps.isError || tasks.isError
  const empty = (followUps.data?.items.length ?? 0) === 0 && (tasks.data?.items.length ?? 0) === 0

  const saveTask = async (values: TaskFormValues) => {
    const input = { ...toCreateTaskInput(values), leadId: lead.id }
    if (taskEditor && taskEditor !== 'new') await updateTask.mutateAsync({ id: taskEditor.id, patch: input })
    else await createTask.mutateAsync(input)
    setTaskEditor(null)
    toast.success(taskEditor === 'new' ? 'Task created' : 'Task updated')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <RoleGate resource="followups" action="create">
          <Button type="button" onClick={() => openFollowUp({ leadIds: [lead.id], lockLead: true, assigneeId: lead.assignedTo ?? undefined })}>
            Add follow-up
          </Button>
        </RoleGate>
        <RoleGate resource="tasks" action="create">
          <Button type="button" variant="outline" onClick={() => setTaskEditor('new')}>
            Add task
          </Button>
        </RoleGate>
      </div>
      {loading ? <Skeleton className="h-24 w-full" /> : null}
      {error ? (
        <EmptyState
          size="sm"
          tone="destructive"
          title="Couldn't load follow-ups"
          action={<Button variant="outline" onClick={() => { void followUps.refetch(); void tasks.refetch() }}>Retry</Button>}
        />
      ) : null}
      {!loading && !error && empty ? (
        <EmptyState size="sm" title="No follow-ups or tasks" description="Scheduled work for this lead will show up here." />
      ) : null}
      <section className="space-y-2" aria-label="Follow-ups">
        {followUps.data?.items.map((item) => {
          const person = userById(lookups, item.assigneeId)
          return (
            <FollowUpItem
              key={item.id}
              followUp={item}
              leadName={lead.name}
              showLead={false}
              assigneeName={person?.name}
              assigneeAvatar={person?.avatarUrl}
              now={now}
              actions={{
                phone: lead.phone,
                email: lead.email,
                whatsapp: lead.whatsapp,
                onComplete: () => { setTarget(item); setDialog('complete') },
                onReschedule: () => { setTarget(item); setDialog('reschedule') },
                onSnooze: (minutes) => snooze.mutate({ id: item.id, minutes }),
              }}
            />
          )
        })}
      </section>
      <section className="space-y-2" aria-label="Tasks">
        {tasks.data?.items.map((item) => {
          const person = userById(lookups, item.assigneeId)
          return (
            <TaskRow
              key={item.id}
              task={item}
              now={now}
              assigneeName={person?.name}
              assigneeAvatar={person?.avatarUrl}
              onToggle={() => (item.status === 'done' ? reopenTask.mutate(item.id) : completeTask.mutate(item.id))}
              onEdit={() => setTaskEditor(item)}
              onDuplicate={() => {
                void createTask.mutateAsync({
                  title: `${item.title} (copy)`,
                  description: item.description,
                  dueAt: item.dueAt,
                  priority: item.priority,
                  assigneeId: item.assigneeId,
                  reminderAt: item.reminderAt,
                  leadId: lead.id,
                  dealId: item.dealId,
                })
              }}
              onDelete={() => void deleteTask.mutateAsync(item.id)}
            />
          )
        })}
      </section>
      <CompleteFollowUpDialog
        open={dialog === 'complete'}
        loading={complete.isPending}
        onOpenChange={(open) => !open && setDialog(null)}
        onConfirm={async (result) => {
          if (!target) return
          await complete.mutateAsync({ id: target.id, outcome: result.outcome, note: result.note })
          if (result.scheduleNext) {
            openFollowUp({ leadIds: [lead.id], lockLead: true, type: target.type, assigneeId: target.assigneeId })
          }
          setDialog(null)
          toast.success('Follow-up completed')
        }}
      />
      <RescheduleDialog
        key={target?.id ?? 'none'}
        open={dialog === 'reschedule'}
        initialDueAt={target?.dueAt}
        loading={reschedule.isPending}
        onOpenChange={(open) => !open && setDialog(null)}
        onConfirm={async (dueAt, reason) => {
          if (!target) return
          await reschedule.mutateAsync({ id: target.id, input: { dueAt, reason } })
          setDialog(null)
        }}
      />
      <TaskDialog
        open={taskEditor !== null}
        task={taskEditor && taskEditor !== 'new' ? taskEditor : null}
        assigneeId={lead.assignedTo ?? userId}
        leadId={lead.id}
        lockLead
        leadLabel={lead.name}
        deals={(deals.data?.items ?? []).map((deal) => ({ id: deal.id, label: deal.title }))}
        submitting={createTask.isPending || updateTask.isPending}
        onOpenChange={(open) => !open && setTaskEditor(null)}
        onSubmit={saveTask}
      />
    </div>
  )
}
