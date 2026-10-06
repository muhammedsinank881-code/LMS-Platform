import type { ComponentType } from 'react'
import {
  FOLLOWUP_TYPES,
  type AutomationTriggerType,
  type LeadFilterField,
} from '@/types'
import { WATCHABLE_FIELDS, WEEKDAY_OPTIONS } from './options'
import { NoConfig, NumberInput, PickMany, PickOne, PickOrAny, Row, TextInput } from './controls'
import type { TriggerFormProps } from './types'
import { Input } from '@/components/ui'

const label = (value: string) => value.replace(/^\w/, (c) => c.toUpperCase())
type Forms = { [T in AutomationTriggerType]: ComponentType<TriggerFormProps<T>> }

/** One config form per trigger type. Adding a trigger type is a one-place change here and in the registry. */
export const TRIGGER_FORMS: Forms = {
  lead_created: ({ trigger, onChange, options }) => (
    <PickMany
      label="Only for these sources"
      hint="Leave empty to run for every source."
      value={trigger.sourceIds}
      options={options.sources}
      onChange={(sourceIds) => onChange({ ...trigger, sourceIds })}
      placeholder="Any source"
    />
  ),
  lead_updated: ({ trigger, onChange }) => (
    <PickOne label="When this field changes" value={trigger.field} options={WATCHABLE_FIELDS} onChange={(field) => onChange({ ...trigger, field: field as LeadFilterField })} />
  ),
  status_changed: ({ trigger, onChange, options }) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <PickOrAny label="From status" value={trigger.fromStatusId} options={options.statuses} onChange={(fromStatusId) => onChange({ ...trigger, fromStatusId })} />
      <PickOrAny label="To status" value={trigger.toStatusId} options={options.statuses} onChange={(toStatusId) => onChange({ ...trigger, toStatusId })} />
    </div>
  ),
  lead_assigned: ({ trigger, onChange, options }) => (
    <PickOrAny label="Assigned to" value={trigger.toUserId} options={options.users} anyLabel="Anyone" onChange={(toUserId) => onChange({ ...trigger, toUserId })} />
  ),
  score_crossed: ({ trigger, onChange }) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberInput label="Score threshold" min={0} max={100} value={trigger.threshold} onChange={(threshold) => onChange({ ...trigger, threshold })} />
      <PickOne
        label="Direction"
        value={trigger.direction}
        onChange={(direction) => onChange({ ...trigger, direction: direction as typeof trigger.direction })}
        options={[
          { value: 'up', label: 'Rises to or above' },
          { value: 'down', label: 'Falls below' },
          { value: 'either', label: 'Crosses either way' },
        ]}
      />
    </div>
  ),
  lead_not_contacted: ({ trigger, onChange, errors }) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberInput label="Not contacted for" min={1} value={trigger.amount} error={errors[0]} onChange={(amount) => onChange({ ...trigger, amount })} />
      <PickOne
        label="Unit"
        value={trigger.unit}
        onChange={(unit) => onChange({ ...trigger, unit: unit as typeof trigger.unit })}
        options={[
          { value: 'hours', label: 'Hours' },
          { value: 'days', label: 'Days' },
        ]}
      />
    </div>
  ),
  followup_overdue: () => <NoConfig text="Runs when a pending follow-up passes its due time." />,
  followup_completed: ({ trigger, onChange }) => (
    <PickOrAny
      label="Follow-up type"
      value={trigger.followUpType}
      options={FOLLOWUP_TYPES.map((t) => ({ value: t, label: label(t) }))}
      onChange={(followUpType) => onChange({ ...trigger, followUpType: followUpType as typeof trigger.followUpType })}
    />
  ),
  deal_stage_changed: ({ trigger, onChange, options }) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <PickOrAny label="Pipeline" value={trigger.pipelineId} options={options.pipelines} onChange={(pipelineId) => onChange({ ...trigger, pipelineId })} />
      <PickOrAny label="From stage" value={trigger.fromStageId} options={options.stages} onChange={(fromStageId) => onChange({ ...trigger, fromStageId })} />
      <PickOrAny label="To stage" value={trigger.toStageId} options={options.stages} onChange={(toStageId) => onChange({ ...trigger, toStageId })} />
    </div>
  ),
  deal_won: () => <NoConfig text="Runs when a deal moves to a won stage." />,
  deal_lost: () => <NoConfig text="Runs when a deal moves to a lost stage." />,
  message_received: ({ trigger, onChange }) => (
    <PickOrAny
      label="Channel"
      value={trigger.channel}
      anyLabel="Any channel"
      options={[
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'email', label: 'Email' },
      ]}
      onChange={(channel) => onChange({ ...trigger, channel: channel as typeof trigger.channel })}
    />
  ),
  form_submitted: ({ trigger, onChange }) => (
    <TextInput label="Form name (optional)" value={trigger.formId ?? ''} placeholder="Any form" onChange={(formId) => onChange({ ...trigger, formId: formId.trim() || null })} />
  ),
  import_completed: () => <NoConfig text="Runs once when a lead import finishes." />,
  scheduled: ({ trigger, onChange, errors }) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <PickOne
        label="Repeats"
        value={trigger.frequency}
        onChange={(frequency) => onChange({ ...trigger, frequency: frequency as typeof trigger.frequency })}
        options={[
          { value: 'daily', label: 'Every day' },
          { value: 'weekly', label: 'Every week' },
        ]}
      />
      {trigger.frequency === 'weekly' ? (
        <PickOne label="On" value={String(trigger.weekday)} options={WEEKDAY_OPTIONS} onChange={(day) => onChange({ ...trigger, weekday: Number(day) })} />
      ) : null}
      <Row label="At" error={errors[0]}>
        {(id, invalid) => <Input id={id} type="time" invalid={invalid} value={trigger.time} onChange={(e) => onChange({ ...trigger, time: e.target.value })} />}
      </Row>
    </div>
  ),
}
