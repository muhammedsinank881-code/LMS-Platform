import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { ACTION_REGISTRY } from '@/lib/automation'
import type { AutomationActionType } from '@/types'
import { ACTION_ICONS } from '../../lib/action-icons'

export interface ActionHeaderProps {
  type: AutomationActionType
  /** 1-based position shown in the badge. */
  step: string
  summary: string
  canMoveUp: boolean
  canMoveDown: boolean
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  disabled?: boolean
}

/** Title row of an action card: icon, label, plain-language summary, and keyboard-friendly move/remove buttons. */
export function ActionHeader({ type, step, summary, canMoveUp, canMoveDown, onMove, onRemove, disabled }: ActionHeaderProps) {
  const Icon = ACTION_ICONS[type]
  const label = ACTION_REGISTRY[type].label
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden="true">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          <span className="text-muted-foreground">Step {step} · </span>
          {label}
        </p>
        <p className="truncate text-sm text-muted-foreground" title={summary}>
          {summary}
        </p>
      </div>
      <div className="flex shrink-0 items-center">
        <Button type="button" variant="ghost" size="icon-sm" disabled={disabled || !canMoveUp} aria-label={`Move step ${step}, ${label}, up`} onClick={() => onMove(-1)}>
          <ChevronUp />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" disabled={disabled || !canMoveDown} aria-label={`Move step ${step}, ${label}, down`} onClick={() => onMove(1)}>
          <ChevronDown />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" disabled={disabled} aria-label={`Remove step ${step}, ${label}`} onClick={onRemove}>
          <Trash2 />
        </Button>
      </div>
    </div>
  )
}

export function Issues({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null
  return (
    <ul className="space-y-1" aria-label="Problems with this step">
      {messages.map((message) => (
        <li key={message} role="alert" className="text-sm text-destructive">
          {message}
        </li>
      ))}
    </ul>
  )
}
