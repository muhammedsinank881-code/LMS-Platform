import type { ListParams, TenantOwned } from './common'
import type { ConversationId, LeadId, MessageId, TemplateId, UserId } from './ids'

export const CHANNELS = ['whatsapp', 'email', 'call'] as const
export type Channel = (typeof CHANNELS)[number]

export const CONVERSATION_STATUSES = ['open', 'closed'] as const
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number]

export const MESSAGE_TYPES = ['text', 'image', 'document', 'audio', 'template', 'note'] as const
export type MessageType = (typeof MESSAGE_TYPES)[number]

export const MESSAGE_STATUSES = ['queued', 'sent', 'delivered', 'read', 'failed'] as const
export type MessageStatus = (typeof MESSAGE_STATUSES)[number]

export type MessageDirection = 'inbound' | 'outbound'

export interface MessageAttachment {
  name: string
  kind: 'image' | 'document' | 'audio'
  sizeKb: number
  url?: string
}

export interface EmailDraft {
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
}

export interface Message extends TenantOwned {
  id: MessageId
  conversationId: ConversationId
  channel: Channel
  direction: MessageDirection
  type: MessageType
  /** Message text, email body, or call notes. */
  body: string
  subject?: string | null
  status: MessageStatus
  attachments: MessageAttachment[]
  durationSecs?: number | null
  templateId?: TemplateId | null
  senderId: UserId | null
  isInternalNote: boolean
  queuedAt: string | null
  sentAt: string
  deliveredAt: string | null
  readAt: string | null
  failedAt: string | null
  openedAt: string | null
  clickedAt: string | null
}

export interface Conversation extends TenantOwned {
  id: ConversationId
  leadId: LeadId | null
  channel: Channel
  assignedTo: UserId | null
  status: ConversationStatus
  contactName: string | null
  contactPhone: string | null
  contactEmail: string | null
  subject: string | null
  lastMessageAt: string
  lastMessagePreview: string
  unreadCount: number
  /** WhatsApp 24-hour customer-service window. Null for email and call. */
  windowExpiresAt: string | null
  emailDraft: EmailDraft | null
  createdAt: string
}

export type ConversationFilterField =
  | 'channel'
  | 'assignedTo'
  | 'leadId'
  | 'unreadCount'
  | 'lastMessageAt'
  | 'status'
export type ConversationListParams = ListParams<ConversationFilterField>

export interface SendMessageInput {
  body: string
  subject?: string
  type?: MessageType
  templateId?: TemplateId
  templateVariables?: Record<string, string>
  attachments?: MessageAttachment[]
  isInternalNote?: boolean
  to?: string
  cc?: string
  bcc?: string
}

export interface EmailDraftInput {
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
}

export interface CreateLeadFromConversationInput {
  name?: string
  company?: string | null
}

export * from './message-template'
