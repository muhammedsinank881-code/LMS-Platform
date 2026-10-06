import type { Action, AutomationAction, AutomationActionType, Resource } from '@/types'
import { describeCondition } from './conditions'
import { idLookups, type Lookups } from './lookups'

type ActionOf<T extends AutomationActionType> = Extract<AutomationAction, { type: T }>

export interface ActionDef<T extends AutomationActionType> {
  label: string
  group: 'Lead' | 'Follow-ups' | 'Messages' | 'Notify' | 'Records' | 'Flow'
  /** Permission a creator needs to configure this action. */
  requires: { resource: Resource; action: Action } | null
  defaults(): ActionOf<T>
  /** Imperative phrase for the summary, e.g. "assign to Priya". */
  describe(action: ActionOf<T>, lookups: Lookups): string
}

type Registry = { [T in AutomationActionType]: ActionDef<T> }

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`
const hoursPhrase = (hours: number) => (hours % 24 === 0 && hours >= 24 ? plural(hours / 24, 'day') : plural(hours, 'hour'))
const joinList = (items: string[]) => (items.length ? items.join(', ') : 'no tags')

export const ACTION_REGISTRY: Registry = {
  assign: {
    label: 'Assign lead',
    group: 'Lead',
    requires: { resource: 'leads', action: 'assign' },
    defaults: () => ({ type: 'assign', strategy: 'round_robin', userId: null, teamId: null }),
    describe: (a, l) => {
      if (a.strategy === 'specific_user') return `assign to ${a.userId ? l.user(a.userId) : 'a user'}`
      if (a.strategy === 'rules') return 'assign using the assignment rules'
      return a.teamId ? `assign round-robin in ${l.team(a.teamId)}` : 'assign round-robin'
    },
  },
  change_status: {
    label: 'Change status',
    group: 'Lead',
    requires: { resource: 'leads', action: 'edit' },
    defaults: () => ({ type: 'change_status', statusId: '' }),
    describe: (a, l) => `set status to ${a.statusId ? l.status(a.statusId) : 'a status'}`,
  },
  add_tags: {
    label: 'Add tags',
    group: 'Lead',
    requires: { resource: 'leads', action: 'edit' },
    defaults: () => ({ type: 'add_tags', tags: [] }),
    describe: (a) => `add ${joinList(a.tags)}`,
  },
  remove_tags: {
    label: 'Remove tags',
    group: 'Lead',
    requires: { resource: 'leads', action: 'edit' },
    defaults: () => ({ type: 'remove_tags', tags: [] }),
    describe: (a) => `remove ${joinList(a.tags)}`,
  },
  set_field: {
    label: 'Set a field',
    group: 'Lead',
    requires: { resource: 'leads', action: 'edit' },
    defaults: () => ({ type: 'set_field', field: 'priority', value: 'high' }),
    describe: (a) => `set ${a.field.replace(/^custom\./, '')} to ${String(a.value)}`,
  },
  create_followup: {
    label: 'Create follow-up',
    group: 'Follow-ups',
    requires: { resource: 'followups', action: 'create' },
    defaults: () => ({ type: 'create_followup', followUpType: 'call', dueInHours: 1, priority: 'medium' }),
    describe: (a) => `create a ${a.followUpType} follow-up in ${hoursPhrase(a.dueInHours)}`,
  },
  create_task: {
    label: 'Create task',
    group: 'Follow-ups',
    requires: { resource: 'tasks', action: 'create' },
    defaults: () => ({ type: 'create_task', title: '', dueInHours: 24, priority: 'medium' }),
    describe: (a) => `create the task "${a.title}" due in ${hoursPhrase(a.dueInHours)}`,
  },
  send_whatsapp: {
    label: 'Send WhatsApp template',
    group: 'Messages',
    requires: { resource: 'inbox', action: 'create' },
    defaults: () => ({ type: 'send_whatsapp', templateId: '' }),
    describe: (a, l) => `send WhatsApp template ${a.templateId ? l.template(a.templateId) : ''}`.trim(),
  },
  send_email: {
    label: 'Send email template',
    group: 'Messages',
    requires: { resource: 'inbox', action: 'create' },
    defaults: () => ({ type: 'send_email', templateId: '' }),
    describe: (a, l) => `send email template ${a.templateId ? l.template(a.templateId) : ''}`.trim(),
  },
  notify_user: {
    label: 'Notify a user',
    group: 'Notify',
    requires: null,
    defaults: () => ({ type: 'notify_user', userId: 'assignee', message: '' }),
    describe: (a, l) => `notify ${a.userId === 'assignee' ? 'the owner' : l.user(a.userId)}`,
  },
  notify_team: {
    label: 'Notify manager or team',
    group: 'Notify',
    requires: null,
    defaults: () => ({ type: 'notify_team', target: 'manager', teamId: null, message: '' }),
    describe: (a, l) =>
      a.target === 'manager' ? 'notify the manager' : `notify ${a.teamId ? l.team(a.teamId) : 'the team'}`,
  },
  create_customer: {
    label: 'Create customer',
    group: 'Records',
    requires: { resource: 'customers', action: 'create' },
    defaults: () => ({ type: 'create_customer' }),
    describe: () => 'create a customer',
  },
  create_deal: {
    label: 'Create deal',
    group: 'Records',
    requires: { resource: 'deals', action: 'create' },
    defaults: () => ({ type: 'create_deal', title: '', pipelineId: '', stageId: '', value: null }),
    describe: (a) => `create the deal "${a.title}"`,
  },
  move_deal_stage: {
    label: 'Move deal stage',
    group: 'Records',
    requires: { resource: 'deals', action: 'edit' },
    defaults: () => ({ type: 'move_deal_stage', stageId: '' }),
    describe: (a, l) => `move the deal to ${a.stageId ? l.stage(a.stageId) : 'a stage'}`,
  },
  add_note: {
    label: 'Add a note',
    group: 'Lead',
    requires: { resource: 'leads', action: 'edit' },
    defaults: () => ({ type: 'add_note', text: '' }),
    describe: (a) => `add the note "${a.text}"`,
  },
  call_webhook: {
    label: 'Call a webhook',
    group: 'Flow',
    requires: { resource: 'settings', action: 'edit' },
    defaults: () => ({ type: 'call_webhook', endpointId: '' }),
    describe: () => 'call a webhook endpoint',
  },
  wait: {
    label: 'Wait',
    group: 'Flow',
    requires: null,
    defaults: () => ({ type: 'wait', amount: 1, unit: 'hours' }),
    describe: (a) => `wait ${plural(a.amount, a.unit.replace(/s$/, ''))}`,
  },
  branch: {
    label: 'If / else',
    group: 'Flow',
    requires: null,
    defaults: () => ({
      type: 'branch',
      conditions: { logic: 'and', items: [] },
      then: [],
      else: [],
    }),
    describe: (a, l) => {
      const first = a.conditions.items[0]
      const cond = first && !('logic' in first) ? describeCondition(first, l) : 'the condition holds'
      const side = (list: AutomationAction[]) =>
        list.map((x) => describeAction(x, l)).join(', ') || 'do nothing'
      return `if ${cond}: ${side(a.then)}; otherwise ${side(a.else)}`
    },
  },
}

export const ACTION_GROUPS = ['Lead', 'Follow-ups', 'Messages', 'Notify', 'Records', 'Flow'] as const

export function describeAction(action: AutomationAction, lookups: Lookups = idLookups): string {
  const def = ACTION_REGISTRY[action.type] as ActionDef<typeof action.type>
  return def.describe(action as never, lookups)
}

export function defaultAction(type: AutomationActionType): AutomationAction {
  return ACTION_REGISTRY[type].defaults()
}

/** Action types a user may configure: the ones whose underlying permission they hold. */
export function allowedActionTypes(
  can: (resource: Resource, action: Action) => boolean,
): Set<AutomationActionType> {
  const allowed = new Set<AutomationActionType>()
  for (const [type, def] of Object.entries(ACTION_REGISTRY) as Array<[AutomationActionType, ActionDef<AutomationActionType>]>) {
    if (!def.requires || can(def.requires.resource, def.requires.action)) allowed.add(type)
  }
  return allowed
}
