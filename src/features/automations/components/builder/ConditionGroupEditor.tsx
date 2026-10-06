import { Plus, Trash2 } from 'lucide-react'
import { defaultOperator, FilterRow, type FilterDraft, type FilterFieldConfig } from '@/components/common/filter-builder'
import { Button, Select } from '@/components/ui'
import {
  emptyGroup,
  isConditionGroup,
  type AutomationCondition,
  type ConditionGroup,
  type ConditionLogic,
} from '@/types'

const LOGIC = [
  { value: 'and', label: 'All of these (AND)' },
  { value: 'or', label: 'Any of these (OR)' },
]

type Item = ConditionGroup['items'][number]

interface Props {
  group: ConditionGroup
  onChange: (group: ConditionGroup) => void
  fields: FilterFieldConfig[]
  /** Nested groups are one level deep. */
  nested?: boolean
  /** Shown when the group has no conditions. */
  emptyText?: string
  /** Prefix for error ids, e.g. `conditions`. */
  path?: string
  errors?: Record<string, string>
}

function newCondition(fields: FilterFieldConfig[]): AutomationCondition {
  const first = fields[0]
  return { field: first?.id ?? 'name', operator: defaultOperator(first?.type ?? 'text') } as AutomationCondition
}

/** AND/OR group of condition rows (the FilterBuilder row), with one level of nested groups. */
export function ConditionGroupEditor({
  group,
  onChange,
  fields,
  nested = false,
  emptyText = 'No conditions: this runs every time the trigger fires.',
  path = 'conditions',
  errors = {},
}: Props) {
  const setItems = (items: Item[]) => onChange({ ...group, items })
  const replace = (index: number, item: Item) => setItems(group.items.map((x, i) => (i === index ? item : x)))

  return (
    <div className={nested ? 'space-y-2 rounded-md border border-dashed border-border bg-muted/40 p-3' : 'space-y-3'}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Match</span>
        <div className="w-52">
          <Select
            size="sm"
            aria-label={nested ? 'Nested group logic' : 'Condition logic'}
            options={LOGIC}
            value={group.logic}
            onValueChange={(logic) => onChange({ ...group, logic: logic as ConditionLogic })}
          />
        </div>
      </div>

      {group.items.length === 0 ? <p className="text-sm text-muted-foreground">{emptyText}</p> : null}

      <ul className="space-y-2">
        {group.items.map((item, index) => {
          const itemPath = `${path}.${index}`
          return (
            <li key={itemPath} className="space-y-1">
              {isConditionGroup(item) ? (
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <ConditionGroupEditor
                      group={item}
                      onChange={(next) => replace(index, next)}
                      fields={fields}
                      nested
                      path={itemPath}
                      errors={errors}
                      emptyText="Add a condition to this group."
                    />
                  </div>
                  <Button variant="ghost" size="icon-sm" aria-label="Remove group" onClick={() => setItems(group.items.filter((_, i) => i !== index))}>
                    <Trash2 />
                  </Button>
                </div>
              ) : (
                <FilterRow
                  fields={fields}
                  row={item as FilterDraft}
                  onChange={(row) => replace(index, row as AutomationCondition)}
                  onRemove={() => setItems(group.items.filter((_, i) => i !== index))}
                />
              )}
              {errors[itemPath] ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors[itemPath]}
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setItems([...group.items, newCondition(fields)])}>
          <Plus />
          Add condition
        </Button>
        {nested ? null : (
          <Button variant="ghost" size="sm" onClick={() => setItems([...group.items, { ...emptyGroup('or'), items: [newCondition(fields)] }])}>
            <Plus />
            Add group
          </Button>
        )}
      </div>
    </div>
  )
}
