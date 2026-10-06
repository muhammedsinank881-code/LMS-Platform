import type { ComponentType } from 'react'
import { FOLLOWUP_TYPES, PRIORITIES, type LeafActionType } from '@/types'
import { NumberInput, PickOne, PickOrAny, TextInput } from './controls'
import type { ActionFormProps } from './types'

const cap = (value: string) => value.replace(/^\w/, (c) => c.toUpperCase())
const PRIORITY_OPTIONS = PRIORITIES.map((p) => ({ value: p, label: cap(p) }))
const OWNER = '__owner__'

type Forms = Pick<
  { [T in LeafActionType]: ComponentType<ActionFormProps<T>> },
  'create_followup' | 'create_task' | 'send_whatsapp' | 'send_email' | 'notify_user' | 'notify_team'
>

export const WORK_ACTION_FORMS: Forms = {
  create_followup: ({ action, onChange, errors }) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <PickOne
        label="Type"
        value={action.followUpType}
        options={FOLLOWUP_TYPES.map((t) => ({ value: t, label: cap(t) }))}
        onChange={(followUpType) => onChange({ ...action, followUpType: followUpType as typeof action.followUpType })}
      />
      <NumberInput label="Due in (hours)" min={0} value={action.dueInHours} error={errors[0]} hint="0.25 is 15 minutes." onChange={(dueInHours) => onChange({ ...action, dueInHours })} />
      <PickOne label="Priority" value={action.priority} options={PRIORITY_OPTIONS} onChange={(priority) => onChange({ ...action, priority: priority as typeof action.priority })} />
    </div>
  ),
  create_task: ({ action, onChange, errors }) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="sm:col-span-3">
        <TextInput label="Title" value={action.title} error={errors[0]} hint="You can use {{lead.name}}." onChange={(title) => onChange({ ...action, title })} />
      </div>
      <NumberInput label="Due in (hours)" min={0} value={action.dueInHours} onChange={(dueInHours) => onChange({ ...action, dueInHours })} />
      <PickOne label="Priority" value={action.priority} options={PRIORITY_OPTIONS} onChange={(priority) => onChange({ ...action, priority: priority as typeof action.priority })} />
    </div>
  ),
  send_whatsapp: ({ action, onChange, options, errors }) => (
    <PickOne label="WhatsApp template" value={action.templateId} options={options.whatsappTemplates} error={errors[0]} onChange={(templateId) => onChange({ ...action, templateId })} placeholder="Choose an approved template" />
  ),
  send_email: ({ action, onChange, options, errors }) => (
    <PickOne label="Email template" value={action.templateId} options={options.emailTemplates} error={errors[0]} onChange={(templateId) => onChange({ ...action, templateId })} placeholder="Choose an email template" />
  ),
  notify_user: ({ action, onChange, options, errors }) => (
    <div className="grid gap-3">
      <PickOne
        label="Who"
        value={action.userId === 'assignee' ? OWNER : action.userId}
        options={[{ value: OWNER, label: "The lead's owner" }, ...options.users]}
        onChange={(userId) => onChange({ ...action, userId: userId === OWNER ? 'assignee' : userId })}
      />
      <TextInput multiline label="Message" value={action.message} error={errors[0]} hint="You can use {{lead.name}}." onChange={(message) => onChange({ ...action, message })} />
    </div>
  ),
  notify_team: ({ action, onChange, options, errors }) => (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <PickOne
          label="Notify"
          value={action.target}
          options={[
            { value: 'manager', label: 'The manager' },
            { value: 'team', label: 'A whole team' },
          ]}
          onChange={(target) => onChange({ ...action, target: target as typeof action.target })}
        />
        <PickOrAny label="Team" anyLabel="The lead owner's team" value={action.teamId} options={options.teams} onChange={(teamId) => onChange({ ...action, teamId })} />
      </div>
      <TextInput multiline label="Message" value={action.message} error={errors[0]} onChange={(message) => onChange({ ...action, message })} />
    </div>
  ),
}
