import { Plus } from 'lucide-react'
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui'
import { ACTION_GROUPS, ACTION_REGISTRY } from '@/lib/automation'
import { ACTION_TYPES, type AutomationActionType } from '@/types'
import { ACTION_ICONS } from '../../lib/action-icons'

/** Adds a step. Branch bodies pass `leafOnly`: no waits and no nested branches there. */
export function AddActionMenu({
  onAdd,
  allowed,
  leafOnly = false,
  label = 'Add step',
  disabled,
}: {
  onAdd: (type: AutomationActionType) => void
  allowed?: ReadonlySet<AutomationActionType>
  leafOnly?: boolean
  label?: string
  disabled?: boolean
}) {
  const types = ACTION_TYPES.filter((type) => !leafOnly || (type !== 'wait' && type !== 'branch'))
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <Plus />
          {label}
        </Button>
      </DropdownTrigger>
      <DropdownContent className="max-h-80 overflow-y-auto">
        {ACTION_GROUPS.map((group, index) => {
          const inGroup = types.filter((type) => ACTION_REGISTRY[type].group === group)
          if (inGroup.length === 0) return null
          return (
            <DropdownGroup key={group}>
              {index > 0 ? <DropdownSeparator /> : null}
              <DropdownLabel>{group}</DropdownLabel>
              {inGroup.map((type) => {
                const Icon = ACTION_ICONS[type]
                const blocked = allowed ? !allowed.has(type) : false
                return (
                  <DropdownItem key={type} disabled={blocked} onSelect={() => onAdd(type)}>
                    <Icon aria-hidden="true" />
                    {ACTION_REGISTRY[type].label}
                    {blocked ? <span className="ml-auto text-xs text-muted-foreground">No permission</span> : null}
                  </DropdownItem>
                )
              })}
            </DropdownGroup>
          )
        })}
      </DropdownContent>
    </Dropdown>
  )
}
