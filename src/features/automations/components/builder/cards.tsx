import type { ComponentType } from 'react'
import { Card, CardContent } from '@/components/ui'
import { describeAction, type Lookups } from '@/lib/automation'
import type { LeafAction, WaitAction } from '@/types'
import type { AutomationOptions } from '../../hooks/use-automation-refs'
import { ACTION_FORMS } from '../forms/action-forms'
import { WaitForm } from '../forms/WaitForm'
import { ActionHeader, Issues } from './ActionHeader'
import { ConfigSurface } from './ConfigSurface'

export interface CardCommon {
  step: string
  canMoveUp: boolean
  canMoveDown: boolean
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  messages: string[]
  options: AutomationOptions
  lookups: Lookups
  disabled?: boolean
}

/** A single-purpose action (assign, notify, create a task, ...) with its config form. */
export function LeafActionCard({
  action,
  onChange,
  ...common
}: CardCommon & { action: LeafAction; onChange: (action: LeafAction) => void }) {
  const Form = ACTION_FORMS[action.type] as ComponentType<{
    action: LeafAction
    onChange: (action: LeafAction) => void
    options: AutomationOptions
    errors: string[]
  }>
  const summary = describeAction(action, common.lookups)
  return (
    <Card size="sm">
      <CardContent className="space-y-3">
        <ActionHeader type={action.type} summary={summary} {...common} />
        <ConfigSurface title={`Step ${common.step}`} summary={summary}>
          <fieldset disabled={common.disabled} className="space-y-3 border-0 p-0">
            <Form action={action} onChange={onChange} options={common.options} errors={common.messages} />
          </fieldset>
        </ConfigSurface>
        <Issues messages={common.messages.slice(1)} />
      </CardContent>
    </Card>
  )
}

/** Delay steps sit inline in the flow as a slim row, not a full card. */
export function WaitCard({
  action,
  onChange,
  ...common
}: CardCommon & { action: WaitAction; onChange: (action: WaitAction) => void }) {
  const summary = describeAction(action, common.lookups)
  return (
    <Card size="sm" className="border-dashed bg-muted/40">
      <CardContent className="space-y-3">
        <ActionHeader type="wait" summary={summary} {...common} />
        <ConfigSurface title={`Step ${common.step}`} summary={summary}>
          <fieldset disabled={common.disabled} className="border-0 p-0">
            <WaitForm amount={action.amount} unit={action.unit} error={common.messages[0]} onChange={(next) => onChange({ ...action, ...next })} />
          </fieldset>
        </ConfigSurface>
        <Issues messages={common.messages.slice(1)} />
      </CardContent>
    </Card>
  )
}
