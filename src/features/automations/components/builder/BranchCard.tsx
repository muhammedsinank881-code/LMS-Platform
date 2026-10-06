import type { FilterFieldConfig } from '@/components/common/filter-builder'
import { Card, CardContent } from '@/components/ui'
import { defaultAction, describeAction } from '@/lib/automation'
import type { AutomationActionType, BranchAction, LeafAction } from '@/types'
import { moveItem } from '../../lib/builder-draft'
import { ActionHeader, Issues } from './ActionHeader'
import { AddActionMenu } from './AddActionMenu'
import { ConditionGroupEditor } from './ConditionGroupEditor'
import { ConfigSurface } from './ConfigSurface'
import { LeafActionCard, type CardCommon } from './cards'

type Side = 'then' | 'else'

interface BranchProps extends CardCommon {
  action: BranchAction
  onChange: (action: BranchAction) => void
  fieldConfigs: FilterFieldConfig[]
  /** Issues keyed by path, for the steps inside the branch. */
  issues: Record<string, string[]>
  path: string
  allowed?: ReadonlySet<AutomationActionType>
}

function SideList({
  title,
  side,
  steps,
  onChange,
  common,
  issues,
  path,
  allowed,
}: {
  title: string
  side: Side
  steps: LeafAction[]
  onChange: (next: LeafAction[]) => void
  common: Pick<CardCommon, 'options' | 'lookups' | 'disabled'>
  issues: Record<string, string[]>
  path: string
  allowed?: ReadonlySet<AutomationActionType>
}) {
  return (
    <section aria-label={title} className="space-y-2 rounded-md border border-border p-3">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      {steps.length === 0 ? <p className="text-sm text-muted-foreground">No steps on this side.</p> : null}
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li key={`${side}-${index}`}>
            <LeafActionCard
              {...common}
              action={step}
              step={`${index + 1}`}
              canMoveUp={index > 0}
              canMoveDown={index < steps.length - 1}
              messages={issues[`${path}.${side}.${index}`] ?? []}
              onChange={(next) => onChange(steps.map((s, i) => (i === index ? next : s)))}
              onMove={(direction) => onChange(moveItem(steps, index, direction))}
              onRemove={() => onChange(steps.filter((_, i) => i !== index))}
            />
          </li>
        ))}
      </ol>
      <AddActionMenu
        leafOnly
        allowed={allowed}
        disabled={common.disabled}
        label={`Add step ${side === 'then' ? 'if it matches' : 'otherwise'}`}
        onAdd={(type) => onChange([...steps, defaultAction(type) as LeafAction])}
      />
    </section>
  )
}

/** If / else, one level deep: a condition group and a list of simple steps for each side. */
export function BranchCard({ action, onChange, fieldConfigs, issues, path, allowed, ...common }: BranchProps) {
  const summary = describeAction(action, common.lookups)
  const shared = { options: common.options, lookups: common.lookups, disabled: common.disabled }
  return (
    <Card size="sm">
      <CardContent className="space-y-3">
        <ActionHeader type="branch" summary={summary} {...common} />
        <ConfigSurface title={`Step ${common.step}`} summary={summary}>
          <fieldset disabled={common.disabled} className="space-y-3 border-0 p-0">
            <ConditionGroupEditor
              group={action.conditions}
              fields={fieldConfigs}
              path={`${path}.conditions`}
              errors={Object.fromEntries(Object.entries(issues).map(([k, v]) => [k, v[0]]))}
              emptyText="No condition: this branch always takes the first side."
              onChange={(conditions) => onChange({ ...action, conditions })}
            />
            <div className="grid gap-3 lg:grid-cols-2">
              <SideList title="If it matches" side="then" steps={action.then} common={shared} issues={issues} path={path} allowed={allowed} onChange={(then) => onChange({ ...action, then })} />
              <SideList title="Otherwise" side="else" steps={action.else} common={shared} issues={issues} path={path} allowed={allowed} onChange={(next) => onChange({ ...action, else: next })} />
            </div>
          </fieldset>
        </ConfigSurface>
        <Issues messages={common.messages} />
      </CardContent>
    </Card>
  )
}
