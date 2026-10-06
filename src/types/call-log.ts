import type { CallOutcome } from './activity'
import type { ListParams, TenantOwned } from './common'
import type { ConversationId, LeadId, UserId } from './ids'
import type { MessageDirection } from './conversation'

export type CallLogId = string

export interface CallLog extends TenantOwned {
  id: CallLogId
  leadId: LeadId | null
  conversationId: ConversationId | null
  direction: MessageDirection
  durationSecs: number
  outcome: CallOutcome
  notes: string
  recordingUrl: string | null
  userId: UserId
  startedAt: string
}

export interface CreateCallLogInput {
  leadId?: LeadId | null
  conversationId?: ConversationId | null
  direction: MessageDirection
  durationSecs: number
  outcome: CallOutcome
  notes?: string
  startedAt?: string
}

export type CallLogFilterField = 'leadId' | 'conversationId' | 'userId' | 'startedAt' | 'outcome'
export type CallLogListParams = ListParams<CallLogFilterField>
