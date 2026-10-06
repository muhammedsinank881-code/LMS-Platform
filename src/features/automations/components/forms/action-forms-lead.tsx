import type { ComponentType } from 'react'
import type { LeafActionType } from '@/types'
import { PickMany, PickOne, PickOrAny, TextInput } from './controls'
import { SetFieldForm } from './SetFieldForm'
import type { ActionFormProps } from './types'

type Forms = Pick<
  { [T in LeafActionType]: ComponentType<ActionFormProps<T>> },
  'assign' | 'change_status' | 'add_tags' | 'remove_tags' | 'set_field' | 'add_note'
>

export const LEAD_ACTION_FORMS: Forms = {
  assign: ({ action, onChange, options, errors }) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <PickOne
        label="How"
        value={action.strategy}
        onChange={(strategy) => onChange({ ...action, strategy: strategy as typeof action.strategy })}
        options={[
          { value: 'round_robin', label: 'Round-robin' },
          { value: 'specific_user', label: 'A specific user' },
          { value: 'rules', label: 'Using the assignment rules' },
        ]}
      />
      {action.strategy === 'specific_user' ? (
        <PickOne label="User" value={action.userId} options={options.users} error={errors[0]} onChange={(userId) => onChange({ ...action, userId })} />
      ) : null}
      {action.strategy === 'round_robin' ? (
        <PickOrAny label="Within team" anyLabel="Any team" value={action.teamId} options={options.teams} onChange={(teamId) => onChange({ ...action, teamId })} />
      ) : null}
    </div>
  ),
  change_status: ({ action, onChange, options, errors }) => (
    <PickOne label="New status" value={action.statusId} options={options.statuses} error={errors[0]} onChange={(statusId) => onChange({ ...action, statusId })} />
  ),
  add_tags: ({ action, onChange, options, errors }) => (
    <PickMany label="Tags to add" value={action.tags} options={options.tags} error={errors[0]} onChange={(tags) => onChange({ ...action, tags })} placeholder="Choose tags" />
  ),
  remove_tags: ({ action, onChange, options, errors }) => (
    <PickMany label="Tags to remove" value={action.tags} options={options.tags} error={errors[0]} onChange={(tags) => onChange({ ...action, tags })} placeholder="Choose tags" />
  ),
  set_field: SetFieldForm,
  add_note: ({ action, onChange, errors }) => (
    <TextInput multiline label="Note" value={action.text} error={errors[0]} hint="You can use {{lead.name}} and {{owner.name}}." onChange={(text) => onChange({ ...action, text })} />
  ),
}
