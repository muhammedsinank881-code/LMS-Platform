import type { TenantOwned } from './common'
import type { LeadId, UserId } from './ids'
import type { LeadDefaults } from './integration'

/** Lead fields a capture form can ask for. Custom fields are added as `custom.<key>`. */
export const LEAD_CAPTURE_FIELDS = [
  'name',
  'phone',
  'whatsapp',
  'email',
  'company',
  'location',
  'productInterest',
  'budget',
  'requirement',
  'language',
] as const
export type LeadCaptureField = (typeof LEAD_CAPTURE_FIELDS)[number]

export const FORM_INPUT_TYPES = ['text', 'email', 'tel', 'number', 'textarea', 'select'] as const
export type FormInputType = (typeof FORM_INPUT_TYPES)[number]

export interface FormFieldValidation {
  min?: number
  max?: number
  pattern?: string
}

export interface LeadFormField {
  id: string
  /** A LeadCaptureField, or `custom.<key>`. */
  key: string
  label: string
  placeholder: string
  required: boolean
  type: FormInputType
  options: string[]
  validation: FormFieldValidation
}

export const FORM_STATUSES = ['active', 'disabled', 'archived'] as const
export type FormStatus = (typeof FORM_STATUSES)[number]

export interface FormStyle {
  accent: string
  theme: 'light' | 'dark'
  rounded: boolean
}

export interface LeadForm extends TenantOwned {
  /** Globally unique: the public page `/f/:formId` resolves the workspace from it. */
  id: string
  name: string
  status: FormStatus
  fields: LeadFormField[]
  submitLabel: string
  successMessage: string
  redirectUrl: string | null
  consentText: string | null
  spamProtection: boolean
  defaults: LeadDefaults
  notifyUserIds: UserId[]
  style: FormStyle
  submissionCount: number
  createdBy: UserId
  createdAt: string
  updatedAt: string
}

export type LeadFormInput = Omit<
  LeadForm,
  'id' | 'tenantId' | 'status' | 'submissionCount' | 'createdBy' | 'createdAt' | 'updatedAt'
>

/** What the public page may learn about a form. No tenant, owner or routing data. */
export type PublicLeadForm = Pick<
  LeadForm,
  | 'id'
  | 'name'
  | 'fields'
  | 'submitLabel'
  | 'successMessage'
  | 'redirectUrl'
  | 'consentText'
  | 'spamProtection'
  | 'style'
>

export const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'] as const
export type UtmKey = (typeof UTM_KEYS)[number]
export type Utm = Partial<Record<UtmKey, string>>

export interface PublicSubmitInput {
  values: Record<string, string>
  consent?: boolean
  utm?: Utm
  /** A honeypot field real people never fill. */
  honeypot?: string
}

export interface PublicSubmitResult {
  ok: true
  redirectUrl: string | null
  successMessage: string
}

export interface FormSubmission extends TenantOwned {
  id: string
  formId: string
  leadId: LeadId | null
  at: string
  utm: Utm
  duplicate: boolean
  spam: boolean
}

export interface FormSubmissionSummary {
  total: number
  /** Submissions per day, oldest first. */
  daily: Array<{ date: string; count: number }>
  latest: FormSubmission[]
}
