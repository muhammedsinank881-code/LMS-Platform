import type { Priority } from '../common'
import type { FollowUpType } from '../followup'
import type { PipelineId, StageId, StatusId, TeamId, TemplateId, UserId } from '../ids'
import type { ConditionGroup } from './conditions'
import type { DelayUnit } from './triggers'

export type AssignStrategy = 'specific_user' | 'round_robin' | 'rules'

/** Actions that may sit inside a branch. Branches and waits cannot nest. */
export type LeafAction =
  | { type: 'assign'; strategy: AssignStrategy; userId: UserId | null; teamId: TeamId | null }
  | { type: 'change_status'; statusId: StatusId }
  | { type: 'add_tags'; tags: string[] }
  | { type: 'remove_tags'; tags: string[] }
  | { type: 'set_field'; field: string; value: string | number | boolean }
  | { type: 'create_followup'; followUpType: FollowUpType; dueInHours: number; priority: Priority }
  | { type: 'create_task'; title: string; dueInHours: number; priority: Priority }
  | { type: 'send_whatsapp'; templateId: TemplateId }
  | { type: 'send_email'; templateId: TemplateId }
  | { type: 'notify_user'; userId: UserId | 'assignee'; message: string }
  | { type: 'notify_team'; target: 'manager' | 'team'; teamId: TeamId | null; message: string }
  | { type: 'create_customer' }
  | {
      type: 'create_deal'
      title: string
      pipelineId: PipelineId
      stageId: StageId
      value: number | null
    }
  | { type: 'move_deal_stage'; stageId: StageId }
  | { type: 'add_note'; text: string }
  | { type: 'call_webhook'; endpointId: string }

export interface WaitAction {
  type: 'wait'
  amount: number
  unit: DelayUnit
}

export interface BranchAction {
  type: 'branch'
  conditions: ConditionGroup
  then: LeafAction[]
  else: LeafAction[]
}

/** THEN: ordered list of actions, discriminated by `type`. */
export type AutomationAction = LeafAction | WaitAction | BranchAction

export type AutomationActionType = AutomationAction['type']
export type LeafActionType = LeafAction['type']

export const ACTION_TYPES = [
  'assign',
  'change_status',
  'add_tags',
  'remove_tags',
  'set_field',
  'create_followup',
  'create_task',
  'send_whatsapp',
  'send_email',
  'notify_user',
  'notify_team',
  'create_customer',
  'create_deal',
  'move_deal_stage',
  'add_note',
  'call_webhook',
  'wait',
  'branch',
] as const satisfies readonly AutomationActionType[]
