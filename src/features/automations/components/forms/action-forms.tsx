import type { ComponentType } from 'react'
import type { LeafActionType } from '@/types'
import { LEAD_ACTION_FORMS } from './action-forms-lead'
import { WORK_ACTION_FORMS } from './action-forms-work'
import { NoConfig, NumberInput, PickOne, TextInput } from './controls'
import { WebhookActionForm } from './WebhookActionForm'
import type { ActionFormProps } from './types'

type Forms = { [T in LeafActionType]: ComponentType<ActionFormProps<T>> }

const RECORD_FORMS: Pick<Forms, 'create_customer' | 'create_deal' | 'move_deal_stage' | 'call_webhook'> = {
  create_customer: () => <NoConfig text="Converts the lead into a customer. It does nothing if the lead is already one." />,
  create_deal: ({ action, onChange, options, errors }) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <TextInput label="Deal title" value={action.title} error={errors[0]} hint="You can use {{lead.name}}." onChange={(title) => onChange({ ...action, title })} />
      </div>
      <PickOne
        label="Stage"
        value={action.stageId}
        options={options.stages}
        onChange={(stageId) => onChange({ ...action, stageId, pipelineId: options.stagePipeline[stageId] ?? action.pipelineId })}
      />
      <NumberInput label="Value" min={0} value={action.value ?? Number.NaN} hint="Empty uses the lead's budget." onChange={(value) => onChange({ ...action, value: Number.isFinite(value) ? value : null })} />
    </div>
  ),
  move_deal_stage: ({ action, onChange, options, errors }) => (
    <PickOne label="Move the deal to" value={action.stageId} options={options.stages} error={errors[0]} onChange={(stageId) => onChange({ ...action, stageId })} />
  ),
  call_webhook: WebhookActionForm,
}

/** One config form per leaf action type. Waits and branches have their own cards. */
export const ACTION_FORMS: Forms = { ...LEAD_ACTION_FORMS, ...WORK_ACTION_FORMS, ...RECORD_FORMS }
