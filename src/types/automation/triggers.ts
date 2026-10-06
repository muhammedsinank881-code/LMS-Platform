import type { FollowUpType } from '../followup'
import type { LeadFilterField } from '../lead'
import type { PipelineId, SourceId, StageId, StatusId, UserId } from '../ids'

export type TimeUnit = 'minutes' | 'hours' | 'days'
export type DelayUnit = TimeUnit

/** WHEN: discriminated by `type`. Each member carries its own config. */
export type AutomationTrigger =
  | { type: 'lead_created'; sourceIds: SourceId[] }
  | { type: 'lead_updated'; field: LeadFilterField }
  | { type: 'status_changed'; fromStatusId: StatusId | null; toStatusId: StatusId | null }
  | { type: 'lead_assigned'; toUserId: UserId | null }
  | { type: 'score_crossed'; threshold: number; direction: 'up' | 'down' | 'either' }
  | { type: 'lead_not_contacted'; amount: number; unit: 'hours' | 'days' }
  | { type: 'followup_overdue' }
  | { type: 'followup_completed'; followUpType: FollowUpType | null }
  | {
      type: 'deal_stage_changed'
      pipelineId: PipelineId | null
      fromStageId: StageId | null
      toStageId: StageId | null
    }
  | { type: 'deal_won' }
  | { type: 'deal_lost' }
  | { type: 'message_received'; channel: 'whatsapp' | 'email' | null }
  | { type: 'form_submitted'; formId: string | null }
  | { type: 'import_completed' }
  | { type: 'scheduled'; frequency: 'daily' | 'weekly'; time: string; weekday: number }

export type AutomationTriggerType = AutomationTrigger['type']

export const TRIGGER_TYPES = [
  'lead_created',
  'lead_updated',
  'status_changed',
  'lead_assigned',
  'score_crossed',
  'lead_not_contacted',
  'followup_overdue',
  'followup_completed',
  'deal_stage_changed',
  'deal_won',
  'deal_lost',
  'message_received',
  'form_submitted',
  'import_completed',
  'scheduled',
] as const satisfies readonly AutomationTriggerType[]
