import type { TenantOwned } from './common'
import type { TemplateId, UserId } from './ids'

export const TEMPLATE_CHANNELS = ['whatsapp', 'email'] as const
export type TemplateChannel = (typeof TEMPLATE_CHANNELS)[number]

export const TEMPLATE_CATEGORIES = ['marketing', 'utility', 'authentication'] as const
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]

export const TEMPLATE_STATUSES = ['draft', 'pending', 'approved', 'rejected'] as const
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number]

export const TEMPLATE_BUTTON_KINDS = ['quick_reply', 'url', 'call'] as const
export type TemplateButtonKind = (typeof TEMPLATE_BUTTON_KINDS)[number]

export interface TemplateButton {
  kind: TemplateButtonKind
  label: string
  url?: string | null
  phone?: string | null
}

export interface MessageTemplate extends TenantOwned {
  id: TemplateId
  name: string
  channel: TemplateChannel
  category: TemplateCategory
  language: string
  body: string
  subject?: string | null
  header?: string | null
  footer?: string | null
  buttons: TemplateButton[]
  variables: string[]
  sampleValues: Record<string, string>
  status: TemplateStatus
  rejectionReason: string | null
  createdBy: UserId
  createdAt: string
  updatedAt: string
  usageCount?: number
}

export interface TemplateInput {
  name: string
  channel: TemplateChannel
  category: TemplateCategory
  language: string
  body: string
  subject?: string | null
  header?: string | null
  footer?: string | null
  buttons?: TemplateButton[]
  sampleValues?: Record<string, string>
}

export type TemplatePatch = Partial<TemplateInput>

export interface QuickReply extends TenantOwned {
  id: string
  shortcut: string
  body: string
  channel: TemplateChannel | null
  createdBy: UserId
  createdAt: string
  updatedAt: string
}

export interface QuickReplyInput {
  shortcut: string
  body: string
  channel?: TemplateChannel | null
}
