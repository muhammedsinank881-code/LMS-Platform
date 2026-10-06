import type { TenantOwned } from './common'

export const BROADCAST_STATUSES = ['draft', 'scheduled', 'sending', 'completed', 'cancelled'] as const
export type BroadcastStatus = (typeof BROADCAST_STATUSES)[number]

export type BroadcastAudience = { kind: 'view'; viewId: string } | { kind: 'tag'; tag: string }

export interface BroadcastStats {
  total: number
  sent: number
  delivered: number
  read: number
  replied: number
  failed: number
}

export interface BroadcastSchedule {
  mode: 'now' | 'later'
  at: string | null
}

/** Template variable name to a lead field key, or a fixed text prefixed with `text:`. */
export type VariableMap = Record<string, string>

export interface Broadcast extends TenantOwned {
  id: string
  name: string
  templateId: string
  audience: BroadcastAudience
  audienceLabel: string
  variableMap: VariableMap
  schedule: BroadcastSchedule
  status: BroadcastStatus
  stats: BroadcastStats
  excludedOptOut: number
  /** Lead ids still waiting to be sent. The mock drains this in batches. */
  pendingLeadIds: string[]
  createdBy: string
  createdAt: string
  completedAt: string | null
}

export interface AudienceCount {
  total: number
  optedOut: number
  /** In the audience but with no phone number to message. */
  missingNumber: number
  eligible: number
}

export interface BroadcastInput {
  name: string
  templateId: string
  audience: BroadcastAudience
  variableMap: VariableMap
  schedule: BroadcastSchedule
}

export interface BroadcastPreview {
  leadName: string
  text: string
}
