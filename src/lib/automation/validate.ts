import {
  isConditionGroup,
  type AutomationActionType,
  type AutomationContent,
  type ConditionGroup,
  type LeafAction,
} from '@/types'
import { ACTION_REGISTRY } from './action-registry'
import { isKnownField } from './fields'

/** Ids that still exist in the workspace. Anything else is a deleted reference. */
export interface ValidationRefs {
  users: ReadonlySet<string>
  teams: ReadonlySet<string>
  templates: ReadonlySet<string>
  statuses: ReadonlySet<string>
  sources: ReadonlySet<string>
  pipelines: ReadonlySet<string>
  stages: ReadonlySet<string>
  customFieldKeys: readonly string[]
  /** Action types the creator may configure. Omit to allow all. */
  allowedActions?: ReadonlySet<AutomationActionType>
}

export interface ValidationIssue {
  /** `name`, `trigger`, `conditions`, `actions.2`, `actions.3.then.0`. */
  path: string
  message: string
  severity: 'error' | 'warning'
}

const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/

function checkGroup(group: ConditionGroup, path: string, refs: ValidationRefs, out: ValidationIssue[], depth = 0): void {
  if (depth > 2) out.push({ path, message: 'Groups can be nested two levels deep.', severity: 'error' })
  group.items.forEach((item, index) => {
    const at = `${path}.${index}`
    if (isConditionGroup(item)) return checkGroup(item, at, refs, out, depth + 1)
    if (!isKnownField(item.field, refs.customFieldKeys)) {
      out.push({ path: at, message: `"${item.field}" is not a field you can use here.`, severity: 'error' })
      return
    }
    const needsValue = item.operator !== 'is_empty' && item.operator !== 'is_not_empty'
    const value = 'value' in item ? item.value : undefined
    const empty = value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
    if (needsValue && empty) out.push({ path: at, message: 'Choose a value for this condition.', severity: 'error' })
  })
}

function missing(ids: ReadonlySet<string>, id: string | null | undefined): 'empty' | 'deleted' | null {
  if (!id) return 'empty'
  return ids.has(id) ? null : 'deleted'
}

function ref(
  out: ValidationIssue[],
  path: string,
  ids: ReadonlySet<string>,
  id: string | null | undefined,
  noun: string,
): void {
  const problem = missing(ids, id)
  if (problem === 'empty') out.push({ path, message: `Choose a ${noun}.`, severity: 'error' })
  if (problem === 'deleted') out.push({ path, message: `The ${noun} no longer exists. Choose another.`, severity: 'error' })
}

function checkLeaf(action: LeafAction, path: string, refs: ValidationRefs, out: ValidationIssue[]): void {
  switch (action.type) {
    case 'assign':
      if (action.strategy === 'specific_user') ref(out, path, refs.users, action.userId, 'user')
      if (action.teamId && !refs.teams.has(action.teamId)) ref(out, path, refs.teams, action.teamId, 'team')
      break
    case 'change_status':
      ref(out, path, refs.statuses, action.statusId, 'status')
      break
    case 'add_tags':
    case 'remove_tags':
      if (action.tags.length === 0) out.push({ path, message: 'Add at least one tag.', severity: 'error' })
      break
    case 'set_field':
      if (!action.field) out.push({ path, message: 'Choose a field.', severity: 'error' })
      break
    case 'create_followup':
    case 'create_task':
      if (!(action.dueInHours >= 0)) out.push({ path, message: 'Enter when it is due.', severity: 'error' })
      if (action.type === 'create_task' && !action.title.trim()) {
        out.push({ path, message: 'Give the task a title.', severity: 'error' })
      }
      break
    case 'send_whatsapp':
    case 'send_email':
      ref(out, path, refs.templates, action.templateId, 'template')
      break
    case 'notify_user':
      if (action.userId !== 'assignee') ref(out, path, refs.users, action.userId, 'user')
      if (!action.message.trim()) out.push({ path, message: 'Write the notification message.', severity: 'error' })
      break
    case 'notify_team':
      if (action.target === 'team') ref(out, path, refs.teams, action.teamId, 'team')
      if (!action.message.trim()) out.push({ path, message: 'Write the notification message.', severity: 'error' })
      break
    case 'create_deal':
      if (!action.title.trim()) out.push({ path, message: 'Give the deal a title.', severity: 'error' })
      ref(out, path, refs.pipelines, action.pipelineId, 'pipeline')
      ref(out, path, refs.stages, action.stageId, 'stage')
      break
    case 'move_deal_stage':
      ref(out, path, refs.stages, action.stageId, 'stage')
      break
    case 'add_note':
      if (!action.text.trim()) out.push({ path, message: 'Write the note.', severity: 'error' })
      break
    case 'call_webhook':
      if (!action.endpointId) out.push({ path, message: 'Pick a webhook endpoint.', severity: 'error' })
      break
    case 'create_customer':
      break
  }
  const allowed = refs.allowedActions
  if (allowed && !allowed.has(action.type)) {
    out.push({ path, message: `You do not have permission to configure "${ACTION_REGISTRY[action.type].label}".`, severity: 'error' })
  }
}

/** Builder validation: missing config, deleted references, permissions and unreachable steps. */
export function validateAutomation(content: AutomationContent, refs: ValidationRefs): ValidationIssue[] {
  const out: ValidationIssue[] = []
  if (!content.name.trim()) out.push({ path: 'name', message: 'Name your automation.', severity: 'error' })

  const t = content.trigger
  if (t.type === 'lead_not_contacted' && !(t.amount > 0)) {
    out.push({ path: 'trigger', message: 'Enter how long without contact.', severity: 'error' })
  }
  if (t.type === 'score_crossed' && !(t.threshold >= 0 && t.threshold <= 100)) {
    out.push({ path: 'trigger', message: 'Threshold must be between 0 and 100.', severity: 'error' })
  }
  if (t.type === 'scheduled' && !CLOCK.test(t.time)) {
    out.push({ path: 'trigger', message: 'Enter a time like 09:00.', severity: 'error' })
  }
  if (t.type === 'lead_created') {
    t.sourceIds.filter((id) => !refs.sources.has(id)).forEach(() =>
      out.push({ path: 'trigger', message: 'A source in this trigger no longer exists.', severity: 'error' }),
    )
  }
  if (t.type === 'status_changed') {
    for (const id of [t.fromStatusId, t.toStatusId]) {
      if (id && !refs.statuses.has(id)) out.push({ path: 'trigger', message: 'A status in this trigger no longer exists.', severity: 'error' })
    }
  }

  checkGroup(content.conditions, 'conditions', refs, out)

  if (content.actions.length === 0) {
    out.push({ path: 'actions', message: 'Add at least one action.', severity: 'error' })
  }
  content.actions.forEach((action, index) => {
    const path = `actions.${index}`
    if (action.type === 'wait') {
      if (!(action.amount > 0)) out.push({ path, message: 'Enter how long to wait.', severity: 'error' })
      if (index === content.actions.length - 1) {
        out.push({ path, message: 'Nothing happens after this wait, so it has no effect.', severity: 'warning' })
      }
    } else if (action.type === 'branch') {
      checkGroup(action.conditions, `${path}.conditions`, refs, out)
      if (action.then.length === 0 && action.else.length === 0) {
        out.push({ path, message: 'Both sides of this branch are empty.', severity: 'warning' })
      }
      if (action.conditions.items.length === 0 && action.else.length > 0) {
        out.push({ path: `${path}.else`, message: 'The else steps can never run: an empty condition always matches.', severity: 'warning' })
      }
      action.then.forEach((leaf, i) => checkLeaf(leaf, `${path}.then.${i}`, refs, out))
      action.else.forEach((leaf, i) => checkLeaf(leaf, `${path}.else.${i}`, refs, out))
    } else {
      checkLeaf(action, path, refs, out)
    }
  })
  return out
}

export const hasErrors = (issues: readonly ValidationIssue[]) =>
  issues.some((issue) => issue.severity === 'error')
