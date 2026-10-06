import { useCallback, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { queryBlocked } from '@/components/common/query-blocked'
import { NoAccess } from '@/components/common/NoAccess'
import { Button, Input, Select, toast } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { useDirectory } from '@/features/team/hooks/use-team'
import { useStatuses } from '../hooks/use-lead-config'
import { SectionIntro } from '../components/SettingsLayout'
import { useRegisterSave } from '../components/use-save-bar'
import { useUpdateWorkspaceSettings, useWorkspaceSettings } from '../hooks/use-settings'
import { workspaceSchema, type WorkspaceValues } from '../schemas'

export function WorkspaceSettingsPage() {
  const { canSection } = usePermission()
  const workspace = useWorkspaceSettings()
  const statuses = useStatuses()
  const users = useDirectory()
  const save = useUpdateWorkspaceSettings()
  const current = workspace.data
  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    values: {
      name: current?.name ?? '',
      currency: current?.currency ?? 'INR',
      timezone: current?.timezone ?? 'Asia/Kolkata',
      dateFormat: current?.dateFormat ?? 'dd MMM yyyy',
      fiscalYearStart: current?.fiscalYearStart ?? 4,
      hoursStart: current?.businessHours?.start ?? '09:00',
      hoursEnd: current?.businessHours?.end ?? '18:00',
      defaultStatusId: current?.defaultStatusId ?? '',
      fallbackUserId: current?.assignmentFallback?.userId ?? '',
    },
  })
  const dirty = form.formState.isDirty
  const days = current?.businessHours?.days
  const submit = useCallback(() => {
    void form.handleSubmit((values) =>
      save.mutate(
        {
          name: values.name,
          currency: values.currency,
          timezone: values.timezone,
          dateFormat: values.dateFormat,
          fiscalYearStart: values.fiscalYearStart,
          businessHours: { days: days ?? [1, 2, 3, 4, 5], start: values.hoursStart, end: values.hoursEnd },
          defaultStatusId: values.defaultStatusId || null,
          assignmentFallback: { userId: values.fallbackUserId || null },
        },
        {
          onSuccess: () => {
            form.reset(values)
            toast.success('Workspace saved')
          },
        },
      ),
    )()
  }, [days, form, save])
  const discard = useCallback(() => form.reset(), [form])
  const registration = useMemo(
    () => (dirty ? { dirty: true, saving: save.isPending, save: submit, discard } : null),
    [dirty, discard, save.isPending, submit],
  )
  useRegisterSave(registration)
  if (!canSection('workspace')) return <NoAccess />
  const blocked = queryBlocked(workspace)
  if (blocked) return blocked
  return (
    <div className="space-y-6">
      <SectionIntro title="Workspace" description="Shared defaults for currency, time and new leads." />
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <FormField id="ws-name" label="Name" error={form.formState.errors.name?.message}>
          {(c) => <Input {...c} {...form.register('name')} />}
        </FormField>
        <FormField id="ws-currency" label="Currency">
          {(c) => <Select {...c} options={['INR', 'USD', 'EUR'].map((value) => ({ value, label: value }))} value={form.watch('currency')} onValueChange={(value) => form.setValue('currency', value, { shouldDirty: true })} />}
        </FormField>
        <FormField id="ws-zone" label="Timezone">
          {(c) => <Input {...c} {...form.register('timezone')} />}
        </FormField>
        <FormField id="ws-date" label="Date format">
          {(c) => <Input {...c} {...form.register('dateFormat')} />}
        </FormField>
        <FormField id="ws-start" label="Business hours start" error={form.formState.errors.hoursStart?.message}>
          {(c) => <Input {...c} {...form.register('hoursStart')} />}
        </FormField>
        <FormField id="ws-end" label="Business hours end" error={form.formState.errors.hoursEnd?.message}>
          {(c) => <Input {...c} {...form.register('hoursEnd')} />}
        </FormField>
        <FormField id="ws-fiscal" label="Fiscal year starts">
          {(c) => <Input {...c} type="number" min={1} max={12} {...form.register('fiscalYearStart', { valueAsNumber: true })} />}
        </FormField>
        <FormField id="ws-status" label="Default lead status">
          {(c) => (
            <Select {...c} options={(statuses.data ?? []).map((status) => ({ value: status.id, label: status.name }))} value={form.watch('defaultStatusId')} onValueChange={(value) => form.setValue('defaultStatusId', value, { shouldDirty: true })} />
          )}
        </FormField>
        <FormField id="ws-fallback" label="Fallback assignee">
          {(c) => (
            <Select
              {...c}
              options={[{ value: 'unassigned', label: 'Leave unassigned' }, ...(users.data ?? []).map((user) => ({ value: user.id, label: user.name }))]}
              value={form.watch('fallbackUserId') || 'unassigned'}
              onValueChange={(value) => form.setValue('fallbackUserId', value === 'unassigned' ? '' : value, { shouldDirty: true })}
            />
          )}
        </FormField>
      </form>
      <section className="rounded-md border border-border p-4">
        <h3 className="text-sm font-semibold">Danger zone</h3>
        <p className="mt-1 text-sm text-muted-foreground">Deleting a workspace is not available in this preview.</p>
        <Button className="mt-3" variant="destructive" disabled>Delete workspace</Button>
      </section>
    </div>
  )
}
