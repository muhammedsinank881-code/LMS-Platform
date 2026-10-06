import type { ListParams, Priority, TenantOwned } from './common'
import type { DealId, FollowUpId, LeadId, UserId } from './ids'

export const FOLLOWUP_TYPES = [
  'call',
  'whatsapp',
  'email',
  'meeting',
  'demo',
  'reminder',
  'task',
] as const
export type FollowUpType = (typeof FOLLOWUP_TYPES)[number]

export const FOLLOWUP_STATUSES = ['pending', 'done', 'overdue'] as const
export type FollowUpStatus = (typeof FOLLOWUP_STATUSES)[number]

/** Minutes before `dueAt` to remind. `0` means at the due time. `null` means no early reminder. */
export const REMINDER_OFFSETS = [0, 15, 60, 1440] as const
export type ReminderOffsetMinutes = (typeof REMINDER_OFFSETS)[number]

export const FOLLOWUP_OUTCOMES = ['completed', 'no_answer', 'rescheduled'] as const
export type FollowUpOutcome = (typeof FOLLOWUP_OUTCOMES)[number]

export interface FollowUp extends TenantOwned {
  id: FollowUpId
  leadId: LeadId
  dealId?: DealId | null
  type: FollowUpType
  dueAt: string
  assigneeId: UserId
  priority: Priority
  /** `overdue` is derived on read (pending and past due), never stored. */
  status: FollowUpStatus
  notes: string
  reminderOffsetMinutes: ReminderOffsetMinutes | null
  completedAt: string | null
  completionNote?: string | null
  completionOutcome?: FollowUpOutcome | null
  createdBy: UserId | null
  createdAt: string
}

export const FOLLOWUP_BUCKETS = ['overdue', 'today', 'tomorrow', 'upcoming'] as const
export type FollowUpBucket = (typeof FOLLOWUP_BUCKETS)[number]
export type FollowUpBuckets = Record<FollowUpBucket, number>

export type FollowUpFilterField =
  | 'leadId'
  | 'dealId'
  | 'assigneeId'
  | 'type'
  | 'priority'
  | 'status'
  | 'dueAt'
  | 'bucket'
  | 'sourceId'
export type FollowUpListParams = ListParams<FollowUpFilterField>

export interface CompleteFollowUpInput {
  outcome?: FollowUpOutcome
  note?: string
}

export interface RescheduleFollowUpInput {
  dueAt: string
  reason?: string
}
