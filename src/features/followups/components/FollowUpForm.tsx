import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormAlert, FormField } from '@/components/common/FormField'
import { Button, DatePicker, Select, Textarea, TimePicker } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { combineDateAndTime, QUICK_PICKS, quickPickDate, splitDueAt } from '@/lib/followup-schedule'
import { PRIORITIES, FOLLOWUP_TYPES } from '@/types'
import { FOLLOW_UP_TYPE_META, REMINDER_OPTIONS } from '../type-meta'
import { followUpFormSchema, toCreateFollowUpInput, type FollowUpFormValues } from '../schemas'
import { AssigneeField } from './AssigneeField'
import { LeadPicker } from './LeadPicker'

export interface FollowUpFormProps {
  leadIds: string[]
  lockLead: boolean
  leadLabel?: string
  defaultAssigneeId: string
  defaultDueAt?: string
  defaultType?: FollowUpFormValues['type']
  submitting?: boolean
  onSubmit: (values: ReturnType<typeof toCreateFollowUpInput>, leadIds: string[]) => Promise<void>
  onCancel: () => void
}

function initialValues(props: FollowUpFormProps): FollowUpFormValues {
  const due = props.defaultDueAt ? splitDueAt(props.defaultDueAt) : splitDueAt(new Date())
  return {
    leadId: props.leadIds[0] ?? '',
    type: props.defaultType ?? 'call',
    date: due.date,
    time: props.defaultDueAt ? due.time : '17:00',
    assigneeId: props.defaultAssigneeId,
    priority: 'medium',
    notes: '',
    reminder: '15',
  }
}

export function FollowUpForm(props: FollowUpFormProps) {
  const { can } = usePermission()
  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: initialValues(props),
  })
  const { errors, isSubmitting } = form.formState
  const lockedMany = props.lockLead && props.leadIds.length > 1

  useEffect(() => {
    if (!can('followups', 'assign')) form.setValue('assigneeId', props.defaultAssigneeId)
  }, [can, form, props.defaultAssigneeId])

  const applyQuickPick = (id: (typeof QUICK_PICKS)[number]['id']) => {
    const parts = splitDueAt(quickPickDate(id, new Date()))
    form.setValue('date', parts.date, { shouldValidate: true })
    form.setValue('time', parts.time, { shouldValidate: true })
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={form.handleSubmit(async (values) => {
        const dueAt = combineDateAndTime(values.date, values.time)
        const ids = props.leadIds.length > 0 ? props.leadIds : [values.leadId]
        await props.onSubmit(toCreateFollowUpInput({ ...values, leadId: ids[0] ?? values.leadId }, dueAt), ids)
      })}
    >
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-2">
        {errors.root ? <FormAlert>{errors.root.message}</FormAlert> : null}
        {lockedMany ? (
          <FormField id="followup-leads" label="Leads">
            {(control) => <input id={control.id} className="sr-only" readOnly value={props.leadIds.join(',')} />}
          </FormField>
        ) : null}
        {lockedMany ? (
          <p className="text-sm text-muted-foreground">Scheduling for {props.leadIds.length} leads.</p>
        ) : (
          <FormField id="followup-lead" label="Lead" required error={errors.leadId?.message}>
            {(control) => (
              <LeadPicker
                id={control.id}
                invalid={control.invalid}
                aria-describedby={control['aria-describedby']}
                value={form.watch('leadId')}
                locked={props.lockLead}
                lockedLabel={props.leadLabel}
                onChange={(leadId) => form.setValue('leadId', leadId, { shouldValidate: true })}
              />
            )}
          </FormField>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="followup-type" label="Type" required error={errors.type?.message}>
            {(control) => (
              <Select
                id={control.id}
                invalid={control.invalid}
                aria-describedby={control['aria-describedby']}
                value={form.watch('type')}
                onValueChange={(value) => form.setValue('type', value as FollowUpFormValues['type'])}
                options={FOLLOWUP_TYPES.map((type) => ({ value: type, label: FOLLOW_UP_TYPE_META[type].label }))}
              />
            )}
          </FormField>
          <FormField id="followup-priority" label="Priority" required error={errors.priority?.message}>
            {(control) => (
              <Select
                id={control.id}
                invalid={control.invalid}
                aria-describedby={control['aria-describedby']}
                value={form.watch('priority')}
                onValueChange={(value) => form.setValue('priority', value as FollowUpFormValues['priority'])}
                options={PRIORITIES.map((priority) => ({ value: priority, label: priority }))}
              />
            )}
          </FormField>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick dates">
          {QUICK_PICKS.map((pick) => (
            <Button key={pick.id} type="button" size="sm" variant="outline" onClick={() => applyQuickPick(pick.id)}>
              {pick.label}
            </Button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="followup-date" label="Date" required error={errors.date?.message}>
            {(control) => (
              <DatePicker
                id={control.id}
                invalid={control.invalid}
                aria-describedby={control['aria-describedby']}
                value={form.watch('date')}
                onValueChange={(value) => form.setValue('date', value, { shouldValidate: true })}
              />
            )}
          </FormField>
          <FormField id="followup-time" label="Time" required error={errors.time?.message}>
            {(control) => (
              <TimePicker
                id={control.id}
                invalid={control.invalid}
                aria-describedby={control['aria-describedby']}
                value={form.watch('time')}
                onValueChange={(value) => form.setValue('time', value, { shouldValidate: true })}
              />
            )}
          </FormField>
        </div>
        <AssigneeField
          id="followup-assignee"
          resource="followups"
          value={form.watch('assigneeId')}
          error={errors.assigneeId?.message}
          onChange={(userId) => form.setValue('assigneeId', userId, { shouldValidate: true })}
        />
        <FormField id="followup-reminder" label="Reminder" error={errors.reminder?.message}>
          {(control) => (
            <Select
              id={control.id}
              invalid={control.invalid}
              aria-describedby={control['aria-describedby']}
              value={form.watch('reminder')}
              onValueChange={(value) => form.setValue('reminder', value as FollowUpFormValues['reminder'])}
              options={REMINDER_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
          )}
        </FormField>
        <FormField id="followup-notes" label="Notes" error={errors.notes?.message}>
          {(control) => (
            <Textarea
              id={control.id}
              invalid={control.invalid}
              aria-describedby={control['aria-describedby']}
              rows={3}
              value={form.watch('notes') ?? ''}
              onChange={(event) => form.setValue('notes', event.target.value)}
            />
          )}
        </FormField>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={props.onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={props.submitting || isSubmitting}>
          Schedule
        </Button>
      </div>
    </form>
  )
}
