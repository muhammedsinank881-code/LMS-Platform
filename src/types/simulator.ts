import type { LeadId, MessageId, TemplateId } from './ids'
import type { EngagementSignal } from './lead'
import type { Channel, MessageStatus, TemplateStatus } from './conversation'

export interface IncomingWhatsAppInput {
  leadId?: LeadId
  phone?: string
  body: string
}

export interface IncomingEmailInput {
  leadId?: LeadId
  email?: string
  subject: string
  body: string
}

export interface MissedCallInput {
  leadId?: LeadId
  phone?: string
}

export interface ResolveTemplateInput {
  id: TemplateId
  outcome: Extract<TemplateStatus, 'approved' | 'rejected'>
  reason?: string
}

/** A recent outbound message the simulator can act on (delivery changes, email opens). */
export interface SimulatorMessageRef {
  id: MessageId
  channel: Channel
  status: MessageStatus
  contact: string
  preview: string
  sentAt: string
}

/** A tracked behaviour (a reply, a demo, a page visit) that scoring rules can react to. */
export interface EngagementInput {
  leadId: LeadId
  signal: EngagementSignal
}

export interface FormSubmissionInput {
  leadId: LeadId
  formId: string
}

export interface SimulatedClock {
  /** How far the dev clock is ahead of real time. */
  offsetMs: number
  now: string
}
