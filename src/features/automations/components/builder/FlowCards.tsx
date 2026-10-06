import type { ComponentType } from 'react'
import type { FilterFieldConfig } from '@/components/common/filter-builder'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Select } from '@/components/ui'
import { defaultTrigger, TRIGGER_GROUPS, TRIGGER_REGISTRY } from '@/lib/automation'
import { TRIGGER_TYPES, type AutomationTrigger, type AutomationTriggerType, type ConditionGroup } from '@/types'
import type { AutomationOptions } from '../../hooks/use-automation-refs'
import { TRIGGER_FORMS } from '../forms/trigger-forms'
import type { TriggerFormProps } from '../forms/types'
import { ConditionGroupEditor } from './ConditionGroupEditor'

const GROUPED = TRIGGER_GROUPS.map((group) => ({
  label: group,
  options: TRIGGER_TYPES.filter((type) => TRIGGER_REGISTRY[type].group === group).map((type) => ({
    value: type,
    label: TRIGGER_REGISTRY[type].label,
  })),
}))

function StepTag({ children }: { children: string }) {
  return (
    <Badge tone="primary" appearance="solid" size="sm" className="w-fit tracking-wide">
      {children}
    </Badge>
  )
}

/** WHEN: choose what starts the automation and configure it. */
export function WhenCard({
  trigger,
  onChange,
  options,
  issues,
  disabled,
}: {
  trigger: AutomationTrigger
  onChange: (trigger: AutomationTrigger) => void
  options: AutomationOptions
  issues: string[]
  disabled?: boolean
}) {
  const Form = TRIGGER_FORMS[trigger.type] as ComponentType<TriggerFormProps<AutomationTriggerType>>
  return (
    <Card>
      <CardHeader>
        <StepTag>WHEN</StepTag>
        <CardTitle>What starts this automation?</CardTitle>
        <CardDescription>Pick a trigger. It runs whenever this happens in your workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <fieldset disabled={disabled} className="space-y-4 border-0 p-0">
          <Select
            aria-label="Trigger"
            options={GROUPED}
            value={trigger.type}
            onValueChange={(type) => onChange(defaultTrigger(type as AutomationTriggerType))}
          />
          <Form trigger={trigger as never} onChange={onChange as never} options={options} errors={issues} />
        </fieldset>
        {issues.map((message) => (
          <p key={message} role="alert" className="text-sm text-destructive">
            {message}
          </p>
        ))}
      </CardContent>
    </Card>
  )
}

/** IF: optional conditions on the record and the things related to it. */
export function IfCard({
  conditions,
  onChange,
  fieldConfigs,
  issues,
  disabled,
}: {
  conditions: ConditionGroup
  onChange: (conditions: ConditionGroup) => void
  fieldConfigs: FilterFieldConfig[]
  issues: Record<string, string>
  disabled?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <StepTag>IF</StepTag>
        <CardTitle>Only when these are true</CardTitle>
        <CardDescription>
          Conditions can use the lead, its deal, owner, source, campaign, tags, custom fields, score and business hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <fieldset disabled={disabled} className="border-0 p-0">
          <ConditionGroupEditor group={conditions} onChange={onChange} fields={fieldConfigs} errors={issues} />
        </fieldset>
      </CardContent>
    </Card>
  )
}

export function ThenHeader() {
  return (
    <div className="space-y-1">
      <StepTag>THEN</StepTag>
      <h2 className="text-base font-semibold text-foreground">Do these steps, in order</h2>
      <p className="text-sm text-muted-foreground">Drag a step by its handle, or use the arrows. A wait pauses the run until the time passes.</p>
    </div>
  )
}
