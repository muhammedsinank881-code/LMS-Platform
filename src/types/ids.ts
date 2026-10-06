/**
 * Entity ids. Human-readable ones use template-literal types so a bare string cannot be passed
 * where a lead id is expected. The rest are named aliases, which documents intent and lets us
 * tighten them later without touching call sites.
 */
export type LeadId = `L-${number}`
export type DealId = `D-${number}`
export type CustomerId = `C-${number}`
export type TaskId = `TK-${number}`

export type TenantId = string
export type UserId = string
export type TeamId = string
export type StatusId = string
export type SourceId = string
export type CampaignId = string
export type PipelineId = string
export type StageId = string
export type FollowUpId = string
export type ActivityId = string
export type CompanyId = string
export type ConversationId = string
export type MessageId = string
export type TemplateId = string
export type AutomationId = string
export type NotificationId = string
export type AuditLogId = string
export type SavedViewId = string
export type LostReasonId = string
export type TagId = string

const LEAD_ID = /^L-\d+$/
const DEAL_ID = /^D-\d+$/
const CUSTOMER_ID = /^C-\d+$/
const TASK_ID = /^TK-\d+$/

export const isLeadId = (value: string): value is LeadId => LEAD_ID.test(value)
export const isDealId = (value: string): value is DealId => DEAL_ID.test(value)
export const isCustomerId = (value: string): value is CustomerId => CUSTOMER_ID.test(value)
export const isTaskId = (value: string): value is TaskId => TASK_ID.test(value)

export const toLeadId = (n: number): LeadId => `L-${n}`
export const toDealId = (n: number): DealId => `D-${n}`
export const toCustomerId = (n: number): CustomerId => `C-${n}`
export const toTaskId = (n: number): TaskId => `TK-${n}`
