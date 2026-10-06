import type { ListParams, TenantOwned } from './common'
import type { AuditLogId, UserId } from './ids'

export const AUDIT_ACTIONS = [
  'created',
  'updated',
  'deleted',
  'status_changed',
  'assigned',
  'merged',
  'converted',
  'stage_moved',
  'imported',
  'exported',
  'settings_changed',
  'login',
] as const
export type AuditAction = (typeof AUDIT_ACTIONS)[number]

export const AUDIT_ENTITIES = [
  'lead',
  'deal',
  'customer',
  'follow_up',
  'task',
  'campaign',
  'automation',
  'user',
  'setting',
  'conversation',
  'broadcast',
  'spend',
  'target',
  'report',
  'integration',
  'lead_form',
  'api_key',
  'webhook',
] as const
export type AuditEntity = (typeof AUDIT_ENTITIES)[number]

/** A flat snapshot of the changed fields, e.g. { status: 'New' } to { status: 'Qualified' }. */
export type AuditValue = Record<string, string | number | boolean | string[] | null>

export interface AuditLog extends TenantOwned {
  id: AuditLogId
  userId: UserId
  /** 'system' for automation-driven changes. Missing means a user. */
  actorType?: 'user' | 'system'
  /** Display name for system actors, e.g. "Automation: Welcome". */
  actorLabel?: string
  automationId?: string
  action: AuditAction
  entity: AuditEntity
  entityId: string
  /** Human-readable label of the entity, e.g. the lead name. */
  entityLabel: string
  previousValue: AuditValue | null
  newValue: AuditValue | null
  ip: string
  device: string
  createdAt: string
}

export type AuditLogFilterField = 'userId' | 'action' | 'entity' | 'entityId' | 'createdAt'
export type AuditLogListParams = ListParams<AuditLogFilterField>
