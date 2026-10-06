import type { AutomationTrigger, AutomationTriggerType } from '@/types'
import { idLookups, type Lookups } from './lookups'

type TriggerOf<T extends AutomationTriggerType> = Extract<AutomationTrigger, { type: T }>

export interface TriggerDef<T extends AutomationTriggerType> {
  label: string
  group: 'Leads' | 'Follow-ups' | 'Deals' | 'Messages' | 'Other'
  /** Entity the event is about, for the test panel. */
  entity: 'lead' | 'deal' | 'followup' | 'system'
  defaults(): TriggerOf<T>
  /** Lower-case phrase that follows "When", e.g. "a new lead is created". */
  describe(trigger: TriggerOf<T>, lookups: Lookups): string
}

type Registry = { [T in AutomationTriggerType]: TriggerDef<T> }

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const named = (ids: string[], resolve: (id: string) => string) => ids.map(resolve).join(' or ')
const change = (from: string | null, to: string | null, resolve: (id: string) => string) =>
  `${from ? ` from ${resolve(from)}` : ''}${to ? ` to ${resolve(to)}` : ''}`

export const TRIGGER_REGISTRY: Registry = {
  lead_created: {
    label: 'Lead created',
    group: 'Leads',
    entity: 'lead',
    defaults: () => ({ type: 'lead_created', sourceIds: [] }),
    describe: (t, l) =>
      t.sourceIds.length ? `a new lead comes from ${named(t.sourceIds, l.source)}` : 'a new lead is created',
  },
  lead_updated: {
    label: 'Lead field changed',
    group: 'Leads',
    entity: 'lead',
    defaults: () => ({ type: 'lead_updated', field: 'budget' }),
    describe: (t) => `a lead's ${t.field.replace(/([A-Z])/g, ' $1').toLowerCase()} changes`,
  },
  status_changed: {
    label: 'Lead status changed',
    group: 'Leads',
    entity: 'lead',
    defaults: () => ({ type: 'status_changed', fromStatusId: null, toStatusId: null }),
    describe: (t, l) => `a lead's status changes${change(t.fromStatusId, t.toStatusId, l.status)}`,
  },
  lead_assigned: {
    label: 'Lead assigned',
    group: 'Leads',
    entity: 'lead',
    defaults: () => ({ type: 'lead_assigned', toUserId: null }),
    describe: (t, l) => (t.toUserId ? `a lead is assigned to ${l.user(t.toUserId)}` : 'a lead is assigned'),
  },
  score_crossed: {
    label: 'Lead score crosses a threshold',
    group: 'Leads',
    entity: 'lead',
    defaults: () => ({ type: 'score_crossed', threshold: 70, direction: 'up' }),
    describe: (t) =>
      `a lead's score ${t.direction === 'up' ? 'rises to' : t.direction === 'down' ? 'falls below' : 'crosses'} ${t.threshold}`,
  },
  lead_not_contacted: {
    label: 'Lead not contacted',
    group: 'Leads',
    entity: 'lead',
    defaults: () => ({ type: 'lead_not_contacted', amount: 2, unit: 'hours' }),
    describe: (t) => `a lead has not been contacted for ${t.amount} ${t.unit}`,
  },
  followup_overdue: {
    label: 'Follow-up overdue',
    group: 'Follow-ups',
    entity: 'followup',
    defaults: () => ({ type: 'followup_overdue' }),
    describe: () => 'a follow-up becomes overdue',
  },
  followup_completed: {
    label: 'Follow-up completed',
    group: 'Follow-ups',
    entity: 'followup',
    defaults: () => ({ type: 'followup_completed', followUpType: null }),
    describe: (t) => `a ${t.followUpType ?? ''} follow-up is completed`.replace('  ', ' '),
  },
  deal_stage_changed: {
    label: 'Deal stage changed',
    group: 'Deals',
    entity: 'deal',
    defaults: () => ({ type: 'deal_stage_changed', pipelineId: null, fromStageId: null, toStageId: null }),
    describe: (t, l) => `a deal moves stage${change(t.fromStageId, t.toStageId, l.stage)}`,
  },
  deal_won: {
    label: 'Deal won',
    group: 'Deals',
    entity: 'deal',
    defaults: () => ({ type: 'deal_won' }),
    describe: () => 'a deal is won',
  },
  deal_lost: {
    label: 'Deal lost',
    group: 'Deals',
    entity: 'deal',
    defaults: () => ({ type: 'deal_lost' }),
    describe: () => 'a deal is lost',
  },
  message_received: {
    label: 'Message received',
    group: 'Messages',
    entity: 'lead',
    defaults: () => ({ type: 'message_received', channel: null }),
    describe: (t) => `a ${t.channel ?? ''} message is received`.replace('  ', ' '),
  },
  form_submitted: {
    label: 'Form submitted',
    group: 'Other',
    entity: 'lead',
    defaults: () => ({ type: 'form_submitted', formId: null }),
    describe: (t) => (t.formId ? `the "${t.formId}" form is submitted` : 'a form is submitted'),
  },
  import_completed: {
    label: 'Import completed',
    group: 'Other',
    entity: 'system',
    defaults: () => ({ type: 'import_completed' }),
    describe: () => 'a lead import completes',
  },
  scheduled: {
    label: 'Scheduled',
    group: 'Other',
    entity: 'system',
    defaults: () => ({ type: 'scheduled', frequency: 'daily', time: '09:00', weekday: 1 }),
    describe: (t) =>
      t.frequency === 'daily' ? `it is ${t.time} every day` : `it is ${t.time} every ${WEEKDAYS[t.weekday]}`,
  },
}

export const TRIGGER_GROUPS = ['Leads', 'Follow-ups', 'Deals', 'Messages', 'Other'] as const

export function describeTrigger(trigger: AutomationTrigger, lookups: Lookups = idLookups): string {
  const def = TRIGGER_REGISTRY[trigger.type] as TriggerDef<typeof trigger.type>
  return def.describe(trigger as never, lookups)
}

export function defaultTrigger(type: AutomationTriggerType): AutomationTrigger {
  return TRIGGER_REGISTRY[type].defaults()
}
