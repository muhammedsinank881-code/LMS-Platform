import type { FilterFieldConfig } from '@/components/common/filter-builder'
import { SortableList } from '@/components/common/LazySortableList'
import { defaultAction, type Lookups } from '@/lib/automation'
import type { AutomationActionType, LeafAction } from '@/types'
import type { AutomationOptions } from '../../hooks/use-automation-refs'
import { moveItem, newItemId, type ActionItem } from '../../lib/builder-draft'
import { AddActionMenu } from './AddActionMenu'
import { BranchCard } from './BranchCard'
import { LeafActionCard, WaitCard, type CardCommon } from './cards'

interface Props {
  items: ActionItem[]
  onChange: (items: ActionItem[]) => void
  options: AutomationOptions
  lookups: Lookups
  fieldConfigs: FilterFieldConfig[]
  /** Validation messages keyed by path (`actions.2`, `actions.3.then.0`). */
  issues: Record<string, string[]>
  allowed?: ReadonlySet<AutomationActionType>
  disabled?: boolean
}

/** THEN: the ordered steps. Drag to reorder, or use the move buttons (keyboard and touch friendly). */
export function ThenList({ items, onChange, options, lookups, fieldConfigs, issues, allowed, disabled }: Props) {
  const update = (id: string, action: ActionItem['action']) =>
    onChange(items.map((item) => (item.id === id ? { ...item, action } : item)))

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          No steps yet. Add what should happen when the trigger fires.
        </p>
      ) : (
        <SortableList
          label="Automation steps"
          items={items}
          disabled={disabled}
          onReorder={(ids) => onChange(ids.map((id) => items.find((item) => item.id === id)!))}
          renderItem={(item) => {
            const index = items.findIndex((i) => i.id === item.id)
            const path = `actions.${index}`
            const common: CardCommon = {
              step: String(index + 1),
              canMoveUp: index > 0,
              canMoveDown: index < items.length - 1,
              onMove: (direction) => onChange(moveItem(items, index, direction)),
              onRemove: () => onChange(items.filter((i) => i.id !== item.id)),
              messages: issues[path] ?? [],
              options,
              lookups,
              disabled,
            }
            const action = item.action
            if (action.type === 'wait') return <WaitCard {...common} action={action} onChange={(next) => update(item.id, next)} />
            if (action.type === 'branch') {
              return (
                <BranchCard
                  {...common}
                  action={action}
                  fieldConfigs={fieldConfigs}
                  issues={Object.fromEntries(Object.entries(issues).filter(([key]) => key.startsWith(`${path}.`)))}
                  path={path}
                  allowed={allowed}
                  onChange={(next) => update(item.id, next)}
                />
              )
            }
            return <LeafActionCard {...common} action={action} onChange={(next: LeafAction) => update(item.id, next)} />
          }}
        />
      )}
      <AddActionMenu
        allowed={allowed}
        disabled={disabled}
        onAdd={(type) => onChange([...items, { id: newItemId(), action: defaultAction(type) }])}
      />
    </div>
  )
}
