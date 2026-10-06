import { useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { Button, DatePicker, Input, Select, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@/components/ui'
import { CALL_OUTCOMES, type ManualActivityInput } from '@/types'
import { CALL_OUTCOME_LABEL } from '@/components/common/timeline'
import {
  callComposerSchema,
  emailComposerSchema,
  meetingComposerSchema,
  noteComposerSchema,
  type CallComposerValues,
  type EmailComposerValues,
  type MeetingComposerValues,
  type NoteComposerValues,
} from '../../lib/detail-schemas'

export type ComposerTab = 'note' | 'call' | 'meeting' | 'email'

const OUTCOMES = CALL_OUTCOMES.map((value) => ({ value, label: CALL_OUTCOME_LABEL[value] }))

export interface ActivityComposerProps {
  tab: ComposerTab
  onTabChange: (tab: ComposerTab) => void
  focusTick: number
  pending?: boolean
  onSubmit: (input: ManualActivityInput) => void
}

export function ActivityComposer({ tab, onTabChange, focusTick, pending, onSubmit }: ActivityComposerProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focusTick === 0) return
    rootRef.current?.querySelector<HTMLElement>('textarea, input')?.focus()
  }, [focusTick, tab])

  return (
    <div ref={rootRef} className="rounded-md border border-border bg-surface p-4">
      <Tabs variant="pill" value={tab} onValueChange={(value) => onTabChange(value as ComposerTab)}>
        <TabsList aria-label="Log activity">
          <TabsTrigger value="note">Note</TabsTrigger>
          <TabsTrigger value="call">Log call</TabsTrigger>
          <TabsTrigger value="meeting">Log meeting</TabsTrigger>
          <TabsTrigger value="email">Log email</TabsTrigger>
        </TabsList>
        <TabsContent value="note">
          <NoteForm pending={pending} onSubmit={onSubmit} />
        </TabsContent>
        <TabsContent value="call">
          <CallForm pending={pending} onSubmit={onSubmit} />
        </TabsContent>
        <TabsContent value="meeting">
          <MeetingForm pending={pending} onSubmit={onSubmit} />
        </TabsContent>
        <TabsContent value="email">
          <EmailForm pending={pending} onSubmit={onSubmit} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NoteForm({ pending, onSubmit }: { pending?: boolean; onSubmit: (input: ManualActivityInput) => void }) {
  const form = useForm<NoteComposerValues>({ resolver: zodResolver(noteComposerSchema), defaultValues: { text: '' } })
  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit((values) => {
        onSubmit({ type: 'note', data: { text: values.text } })
        form.reset()
      })}
    >
      <FormField id="composer-note" label="Note" required error={form.formState.errors.text?.message}>
        {(control) => <Textarea {...control} {...form.register('text')} rows={3} />}
      </FormField>
      <Button type="submit" loading={pending}>
        Add note
      </Button>
    </form>
  )
}

function CallForm({ pending, onSubmit }: { pending?: boolean; onSubmit: (input: ManualActivityInput) => void }) {
  const form = useForm<CallComposerValues>({
    resolver: zodResolver(callComposerSchema),
    defaultValues: { outcome: 'connected', durationMinutes: 5, notes: '' },
  })
  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit((values) => {
        onSubmit({
          type: 'call',
          data: {
            outcome: values.outcome,
            durationSecs: Math.round(values.durationMinutes * 60),
            notes: values.notes,
          },
        })
        form.reset()
      })}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField id="composer-outcome" label="Outcome" required error={form.formState.errors.outcome?.message}>
          {(control) => (
            <Select
              {...control}
              options={OUTCOMES}
              value={form.watch('outcome')}
              onValueChange={(value) => form.setValue('outcome', value as CallComposerValues['outcome'])}
            />
          )}
        </FormField>
        <FormField id="composer-duration" label="Duration (minutes)" error={form.formState.errors.durationMinutes?.message}>
          {(control) => <Input {...control} type="number" min={0} {...form.register('durationMinutes', { valueAsNumber: true })} />}
        </FormField>
      </div>
      <FormField id="composer-call-notes" label="Notes" error={form.formState.errors.notes?.message}>
        {(control) => <Textarea {...control} {...form.register('notes')} rows={3} />}
      </FormField>
      <Button type="submit" loading={pending}>
        Log call
      </Button>
    </form>
  )
}

function MeetingForm({ pending, onSubmit }: { pending?: boolean; onSubmit: (input: ManualActivityInput) => void }) {
  const form = useForm<MeetingComposerValues>({
    resolver: zodResolver(meetingComposerSchema),
    defaultValues: { startsAt: '', attendees: '', notes: '' },
  })
  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit((values) => {
        onSubmit({
          type: 'meeting',
          data: {
            title: 'Meeting',
            startsAt: new Date(`${values.startsAt}T09:00:00`).toISOString(),
            notes: values.notes,
            ...(values.attendees ? { attendees: values.attendees } : {}),
          },
        })
        form.reset()
      })}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField id="composer-date" label="Date" required error={form.formState.errors.startsAt?.message}>
          {(control) => (
            <DatePicker {...control} value={form.watch('startsAt')} onValueChange={(value) => form.setValue('startsAt', value, { shouldValidate: true })} />
          )}
        </FormField>
        <FormField id="composer-attendees" label="Attendees" error={form.formState.errors.attendees?.message}>
          {(control) => <Input {...control} {...form.register('attendees')} placeholder="Names" />}
        </FormField>
      </div>
      <FormField id="composer-meeting-notes" label="Notes" error={form.formState.errors.notes?.message}>
        {(control) => <Textarea {...control} {...form.register('notes')} rows={3} />}
      </FormField>
      <Button type="submit" loading={pending}>
        Log meeting
      </Button>
    </form>
  )
}

function EmailForm({ pending, onSubmit }: { pending?: boolean; onSubmit: (input: ManualActivityInput) => void }) {
  const form = useForm<EmailComposerValues>({
    resolver: zodResolver(emailComposerSchema),
    defaultValues: { subject: '', body: '' },
  })
  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit((values) => {
        onSubmit({ type: 'email_sent', data: { subject: values.subject, body: values.body } })
        form.reset()
      })}
    >
      <FormField id="composer-subject" label="Subject" required error={form.formState.errors.subject?.message}>
        {(control) => <Input {...control} {...form.register('subject')} />}
      </FormField>
      <FormField id="composer-body" label="Body" required error={form.formState.errors.body?.message}>
        {(control) => <Textarea {...control} {...form.register('body')} rows={4} />}
      </FormField>
      <Button type="submit" loading={pending}>
        Log email
      </Button>
    </form>
  )
}
