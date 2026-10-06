import type { CustomFieldDefinition, QualificationQuestion } from '@/types'

/** Static workspace configuration used by the seed. [slug, name, color, type] */
export const STATUS_DEFS = [
  ['new', 'New', '#6366f1', 'open'],
  ['contacted', 'Contacted', '#0ea5e9', 'open'],
  ['not-reachable', 'Not Reachable', '#94a3b8', 'open'],
  ['interested', 'Interested', '#8b5cf6', 'open'],
  ['qualified', 'Qualified', '#14b8a6', 'open'],
  ['demo', 'Demo Scheduled', '#f59e0b', 'open'],
  ['proposal', 'Proposal Sent', '#f97316', 'open'],
  ['negotiation', 'Negotiation', '#ec4899', 'open'],
  ['on-hold', 'On Hold', '#64748b', 'open'],
  ['won', 'Won', '#22c55e', 'won'],
  ['lost', 'Lost', '#ef4444', 'lost'],
  ['junk', 'Junk', '#6b7280', 'invalid'],
] as const

/** [key, name, lucide icon] */
export const SOURCE_DEFS = [
  ['website', 'Website', 'Globe'],
  ['whatsapp', 'WhatsApp', 'MessageCircle'],
  ['facebook', 'Facebook', 'Facebook'],
  ['instagram', 'Instagram', 'Instagram'],
  ['google_ads', 'Google Ads', 'Search'],
  ['linkedin', 'LinkedIn', 'Linkedin'],
  ['manual', 'Manual entry', 'PenLine'],
  ['phone', 'Phone call', 'Phone'],
  ['email', 'Email', 'Mail'],
  ['landing_page', 'Landing page', 'LayoutTemplate'],
  ['import', 'Import', 'Upload'],
  ['api', 'API', 'Plug'],
] as const

/** [slug, name, color, probability, type] */
export const STAGE_DEFS = [
  ['new', 'New Lead', '#6366f1', 10, 'open'],
  ['qualified', 'Qualified', '#14b8a6', 25, 'open'],
  ['proposal', 'Proposal', '#f97316', 50, 'open'],
  ['negotiation', 'Negotiation', '#ec4899', 75, 'open'],
  ['won', 'Won', '#22c55e', 100, 'won'],
  ['lost', 'Lost', '#ef4444', 0, 'lost'],
] as const

export const LOST_REASONS = [
  'Price',
  'Competitor',
  'No requirement',
  'No response',
  'Timing',
  'Budget',
  'Bad lead',
  'Other',
] as const

/** [name, color] */
export const TAG_DEFS = [
  ['Hot Prospect', '#ef4444'],
  ['VIP', '#8b5cf6'],
  ['Referral', '#22c55e'],
  ['Follow Up', '#f59e0b'],
  ['Price Sensitive', '#64748b'],
  ['Enterprise', '#6366f1'],
  ['Repeat Customer', '#14b8a6'],
  ['Event Lead', '#ec4899'],
] as const

export const SEED_TAGS: readonly string[] = TAG_DEFS.map(([name]) => name)

type QuestionDef = Pick<QualificationQuestion, 'question' | 'type' | 'options' | 'required'>

export const QUESTION_DEFS: QuestionDef[] = [
  { question: 'Is the budget confirmed?', type: 'boolean', options: [], required: true },
  {
    question: 'Is the contact the decision maker?',
    type: 'dropdown',
    options: ['Yes', 'No', 'Influencer'],
    required: true,
  },
  {
    question: 'When do they plan to buy?',
    type: 'dropdown',
    options: ['Immediately', 'Within a month', '1-3 months', '3+ months'],
    required: true,
  },
  { question: 'What is their primary requirement?', type: 'text', options: [], required: false },
  { question: 'What are they using today?', type: 'text', options: [], required: false },
  { question: 'Team size', type: 'number', options: [], required: false },
]

type FieldDef = Pick<
  CustomFieldDefinition,
  'entity' | 'key' | 'label' | 'type' | 'options' | 'required'
>

export const CUSTOM_FIELD_DEFS: FieldDef[] = [
  {
    entity: 'lead',
    key: 'preferred_contact_time',
    label: 'Preferred contact time',
    type: 'dropdown',
    options: ['Morning', 'Afternoon', 'Evening'],
    required: false,
  },
  {
    entity: 'lead',
    key: 'company_size',
    label: 'Company size',
    type: 'number',
    options: [],
    required: false,
  },
  {
    entity: 'lead',
    key: 'gst_number',
    label: 'GST number',
    type: 'text',
    options: [],
    required: false,
  },
  {
    entity: 'lead',
    key: 'site_visit_date',
    label: 'Site visit date',
    type: 'date',
    options: [],
    required: false,
  },
  {
    entity: 'lead',
    key: 'interested_services',
    label: 'Interested services',
    type: 'multiselect',
    options: ['SEO', 'Social media', 'Ads', 'Website', 'Branding'],
    required: false,
  },
  {
    entity: 'lead',
    key: 'brochure_sent',
    label: 'Brochure sent',
    type: 'boolean',
    options: [],
    required: false,
  },
  {
    entity: 'deal',
    key: 'contract_url',
    label: 'Contract link',
    type: 'url',
    options: [],
    required: false,
  },
  {
    entity: 'customer',
    key: 'industry',
    label: 'Industry',
    type: 'dropdown',
    options: ['Retail', 'Manufacturing', 'Healthcare', 'Education', 'Other'],
    required: false,
  },
]
