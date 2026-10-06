import type { TenantOwned } from './common'
import type {
  ActivityId,
  CustomerId,
  DealId,
  FollowUpId,
  LeadId,
  LostReasonId,
  SourceId,
  StatusId,
  UserId,
} from './ids'

export const CALL_OUTCOMES = [
  'connected',
  'no_answer',
  'busy',
  'voicemail',
  'wrong_number',
] as const
export type CallOutcome = (typeof CALL_OUTCOMES)[number]

/** One member per timeline event. `data` is typed by `type`, so consumers narrow with a switch. */
export type ActivityPayload =
  | { type: 'lead_created'; data: { sourceId: SourceId; via?: string } }
  | { type: 'assigned'; data: { toUserId: UserId; ruleId: string | null } }
  | { type: 'reassigned'; data: { fromUserId: UserId | null; toUserId: UserId } }
  | {
      type: 'status_changed'
      data: { fromStatusId: StatusId; toStatusId: StatusId; lostReasonId: LostReasonId | null }
    }
  | { type: 'note'; data: { text: string; pinned?: boolean } }
  | { type: 'call'; data: { durationSecs: number; outcome: CallOutcome; notes: string } }
  | { type: 'whatsapp_sent'; data: { body: string } }
  | { type: 'whatsapp_received'; data: { body: string } }
  | { type: 'email_sent'; data: { subject: string; body: string } }
  | { type: 'email_received'; data: { subject: string; body: string } }
  | { type: 'followup_scheduled'; data: { followUpId: FollowUpId; kind: string; dueAt: string } }
  | { type: 'followup_completed'; data: { followUpId: FollowUpId; kind: string; note: string } }
  | { type: 'meeting'; data: { title: string; startsAt: string; notes: string; attendees?: string } }
  | { type: 'demo'; data: { title: string; startsAt: string; notes: string } }
  | { type: 'quotation_sent'; data: { amount: number; reference: string } }
  | { type: 'score_changed'; data: { from: number; to: number } }
  | { type: 'merged'; data: { secondaryLeadId: LeadId } }
  | { type: 'converted'; data: { customerId: CustomerId } }
  | {
      type: 'stage_changed'
      data: { fromStageId: string; toStageId: string; lostReasonId: LostReasonId | null }
    }

export type ActivityType = ActivityPayload['type']

export const ACTIVITY_TYPES: readonly ActivityType[] = [
  'lead_created',
  'assigned',
  'reassigned',
  'status_changed',
  'note',
  'call',
  'whatsapp_sent',
  'whatsapp_received',
  'email_sent',
  'email_received',
  'followup_scheduled',
  'followup_completed',
  'meeting',
  'demo',
  'quotation_sent',
  'score_changed',
  'merged',
  'converted',
  'stage_changed',
]

export interface ActivityBase extends TenantOwned {
  id: ActivityId
  leadId: LeadId
  dealId?: DealId | null
  /** The user who caused it; null for system events. */
  actorId: UserId | null
  createdAt: string
  /** Set when a note is edited. */
  updatedAt?: string | null
  /** Set when an automation caused the event. */
  automation?: { id: string; name: string } | null
}

export type Activity = ActivityBase & ActivityPayload

/** Events a user can log by hand from the timeline composer. */
export type ManualActivityInput = Extract<
  ActivityPayload,
  { type: 'note' | 'call' | 'email_sent' | 'meeting' | 'demo' | 'quotation_sent' | 'whatsapp_sent' }
>

export interface ActivityListParams {
  types?: ActivityType[]
  page?: number
  pageSize?: number
}
