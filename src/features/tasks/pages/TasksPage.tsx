import { useMemo, useState } from 'react'
import { Plus, ShieldOff } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SavedViews } from '@/components/common/saved-views/SavedViews'
import { SearchInput } from '@/components/common/SearchInput'
import { BulkActionBar } from '@/components/common/BulkActionBar'
import { PageHeader } from '@/components/layout/PageHeader'
import { RoleGate } from '@/components/common/RoleGate'
import { Button, DatePicker, EmptyState, Select, Skeleton, toast } from '@/components/ui'
import { useListUrlState } from '@/hooks/use-list-url-state'
import { useDefaultView } from '@/hooks/use-default-view'
import { usePermission } from '@/hooks/use-permission'
import { groupTasks } from '@/lib/task-groups'
import { useDeals } from '@/features/deals/hooks/use-deals'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { useSavedViews, useCreateSavedView, useDeleteSavedView, useUpdateSavedView } from '@/features/saved-views/hooks/use-saved-views'
import { useDirectory } from '@/features/team/hooks/use-team'
import { useAuthStore } from '@/store/auth-store'
import { PRIORITIES, type SavedView, type Task, type TaskFilterField, type TaskId } from '@/types'
import { TaskDialog } from '../components/TaskDialog'
import { TaskGroups } from '../components/TaskGroups'
import { TaskQuickAdd } from '../components/TaskQuickAdd'
import { useCompleteTask, useCreateTask, useDeleteTask, useReopenTask, useTasks, useUpdateTask } from '../hooks/use-tasks'
import { resolveAssigneeMe } from '../lib/resolve-me'
import { toCreateTaskInput, type TaskFormValues } from '../schemas'

const SORT = [{ field: 'dueAt' as const, direction: 'asc' as const }]

export function TasksPage() {
  const url = useListUrlState<TaskFilterField>({ sort: SORT, pageSize: 200 })
  const { can } = usePermission()
  const userId = useAuthStore((state) => state.user?.id ?? '')
  const filters = useMemo(() => resolveAssigneeMe(url.filters, userId), [url.filters, userId])
  const list = useTasks({ ...url.toListParams(), filters, pageSize: 200 })
  const directory = useDirectory()
  const leads = useLeads({ pageSize: 200 })
  const deals = useDeals({ pageSize: 100 })
  const views = useSavedViews('tasks')
  const createView = useCreateSavedView()
  const updateView = useUpdateSavedView()
  const deleteView = useDeleteSavedView()
  const { defaultViewId, setDefaultViewId } = useDefaultView('tasks')
  const create = useCreateTask()
  const update = useUpdateTask()
  const remove = useDeleteTask()
  const complete = useCompleteTask()
  const reopen = useReopenTask()
  const [editing, setEditing] = useState<Task | null | 'new'>(null)
  const [deleting, setDeleting] = useState<Task | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDelete, setBulkDelete] = useState(false)
  const [dueFrom, setDueFrom] = useState('')
  const [dueTo, setDueTo] = useState('')
  const grouped = useMemo(() => {
    const now = new Date()
    return { now, groups: groupTasks(list.data?.items ?? [], now) }
  }, [list.data?.items])
  const { now, groups } = grouped
  const users = (directory.data ?? []).map((user) => ({ id: user.id, name: user.name }))
  const leadName = (id: string) => leads.data?.items.find((lead) => lead.id === id)?.name ?? id
  const dealOptions = (deals.data?.items ?? []).map((deal) => ({ id: deal.id, label: deal.title }))
  const visible = Object.values(groups).some((items) => items.length > 0)

  const setField = (field: TaskFilterField, value: string) => {
    const rest = url.filters.filter((filter) => filter.field !== field)
    url.setFilters(value && value !== 'all' ? [...rest, { field, operator: 'equals', value }] : rest)
  }
  const setDueRange = (from: string, to: string) => {
    setDueFrom(from)
    setDueTo(to)
    const rest = url.filters.filter((filter) => filter.field !== 'dueAt')
    if (!from || !to) {
      url.setFilters(rest)
      return
    }
    const start = new Date(`${from}T00:00:00`)
    const end = new Date(`${to}T23:59:59`)
    url.setFilters([...rest, { field: 'dueAt', operator: 'between', value: [start.toISOString(), end.toISOString()] }])
  }
  const current = (field: TaskFilterField) => {
    const found = url.filters.find((filter) => filter.field === field && filter.operator === 'equals')
    return found && 'value' in found ? String(found.value) : 'all'
  }

  const saveTask = async (values: TaskFormValues) => {
    const input = toCreateTaskInput(values)
    if (editing && editing !== 'new') {
      await update.mutateAsync({
        id: editing.id,
        patch: { ...input, status: values.status === 'done' ? 'done' : values.status === 'in_progress' ? 'in_progress' : 'open' },
      })
      toast.success('Task updated')
    } else {
      await create.mutateAsync(input)
      toast.success('Task created')
    }
    setEditing(null)
  }

  return (
    <RoleGate resource="tasks" fallback={<EmptyState icon={ShieldOff} title="You don't have access to tasks" />}>
      <PageHeader
        className="mb-2"
        title="Tasks"
        description="Work that is not tied to a single call or meeting."
        actions={
          can('tasks', 'create') ? (
            <Button onClick={() => setEditing('new')}>
              <Plus /> New task
            </Button>
          ) : null
        }
      />
      <div className="mb-2 space-y-2">
        <SavedViews
          views={views.data ?? []}
          selectedId={url.viewId}
          isDirty={false}
          defaultViewId={defaultViewId}
          onSelect={(view: SavedView | null) => {
            if (!view) url.replace({ filters: [], viewId: null, page: 1 })
            else url.replace({ filters: view.conditions as typeof url.filters, sort: view.sort as typeof url.sort, viewId: view.id, page: 1 })
          }}
          onSaveCurrent={(name) => createView.mutate({ entity: 'tasks', name, icon: '📌', conditions: url.filters, sort: url.sort })}
          onRename={(id, name) => updateView.mutate({ id, patch: { name } })}
          onDelete={(id) => deleteView.mutate(id)}
          onSetDefault={setDefaultViewId}
        />
        <TaskQuickAdd
          disabled={create.isPending}
          onCreate={async (title) => {
            await create.mutateAsync({ title, priority: 'medium', assigneeId: userId, dueAt: null, description: '' })
            toast.success('Task added')
          }}
        />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <SearchInput defaultValue={url.search} onValueChange={url.setSearch} aria-label="Search tasks" placeholder="Search tasks" />
          <Select aria-label="Assignee" value={current('assigneeId')} onValueChange={(value) => setField('assigneeId', value)} options={[{ value: 'all', label: 'All assignees' }, ...users.map((user) => ({ value: user.id, label: user.name }))]} />
          <Select aria-label="Priority" value={current('priority')} onValueChange={(value) => setField('priority', value)} options={[{ value: 'all', label: 'All priorities' }, ...PRIORITIES.map((priority) => ({ value: priority, label: priority }))]} />
          <Select aria-label="Status" value={current('status')} onValueChange={(value) => setField('status', value)} options={[{ value: 'all', label: 'All statuses' }, { value: 'open', label: 'Open' }, { value: 'in_progress', label: 'In progress' }, { value: 'done', label: 'Done' }, { value: 'overdue', label: 'Overdue' }]} />
          <DatePicker aria-label="Due from" value={dueFrom} onValueChange={(value) => setDueRange(value, dueTo)} />
          <DatePicker aria-label="Due to" value={dueTo} onValueChange={(value) => setDueRange(dueFrom, value)} />
          <Select aria-label="Related deal" value={current('dealId')} onValueChange={(value) => setField('dealId', value)} options={[{ value: 'all', label: 'Any deal' }, ...dealOptions.map((deal) => ({ value: deal.id, label: deal.label }))]} />
        </div>
      </div>
      {list.isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {list.isError ? <EmptyState tone="destructive" title="Couldn't load tasks" action={<Button variant="outline" onClick={() => void list.refetch()}>Retry</Button>} /> : null}
      {!list.isLoading && !list.isError && !visible ? (
        <EmptyState title={url.search || url.filters.length ? 'No tasks match' : 'No tasks yet'} description="Add a task to keep work moving." />
      ) : null}
      {!list.isLoading && !list.isError && visible ? (
        <TaskGroups
          groups={groups}
          now={now}
          leadName={leadName}
          assignee={(id) => {
            const user = directory.data?.find((item) => item.id === id)
            return user ? { name: user.name, avatar: user.avatarUrl } : null
          }}
          selected={selected}
          onSelectedChange={(id, checked) => setSelected((current) => {
            const next = new Set(current)
            if (checked) next.add(id)
            else next.delete(id)
            return next
          })}
          onToggle={(task) => (task.status === 'done' ? reopen.mutate(task.id) : complete.mutate(task.id))}
          onEdit={setEditing}
          onDuplicate={(task) => {
            void create.mutateAsync({
              title: `${task.title} (copy)`,
              description: task.description,
              dueAt: task.dueAt,
              priority: task.priority,
              assigneeId: task.assigneeId,
              reminderAt: task.reminderAt,
              leadId: task.leadId,
              dealId: task.dealId,
            })
          }}
          onDelete={setDeleting}
        />
      ) : null}
      <BulkActionBar count={selected.size} onClear={() => setSelected(new Set())}>
        <Button size="sm" variant="outline" disabled={!can('tasks', 'edit')} onClick={() => { selected.forEach((id) => complete.mutate(id as TaskId)); setSelected(new Set()) }}>Complete</Button>
        <Button size="sm" variant="outline" disabled={!can('tasks', 'assign') || users.length === 0} onClick={() => { const assigneeId = users[0]?.id; if (!assigneeId) return; selected.forEach((id) => update.mutate({ id: id as TaskId, patch: { assigneeId } })); setSelected(new Set()) }}>Reassign to {users[0]?.name ?? 'first'}</Button>
        <Button size="sm" variant="outline" disabled={!can('tasks', 'edit')} onClick={() => { selected.forEach((id) => update.mutate({ id: id as TaskId, patch: { priority: 'high' } })); setSelected(new Set()) }}>High priority</Button>
        <Button size="sm" variant="destructive" disabled={!can('tasks', 'delete')} onClick={() => setBulkDelete(true)}>Delete</Button>
      </BulkActionBar>
      <TaskDialog
        open={editing !== null}
        task={editing && editing !== 'new' ? editing : null}
        assigneeId={userId}
        deals={dealOptions}
        submitting={create.isPending || update.isPending}
        onOpenChange={(open) => !open && setEditing(null)}
        onSubmit={saveTask}
      />
      <ConfirmDialog
        open={deleting !== null || bulkDelete}
        onOpenChange={(open) => { if (!open) { setDeleting(null); setBulkDelete(false) } }}
        title="Delete task?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={async () => {
          const ids = bulkDelete ? [...selected] : deleting ? [deleting.id] : []
          await Promise.all(ids.map((id) => remove.mutateAsync(id as TaskId)))
          setDeleting(null)
          setBulkDelete(false)
          setSelected(new Set())
        }}
      />
    </RoleGate>
  )
}
