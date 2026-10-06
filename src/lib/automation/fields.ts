import type { FieldValue } from '@/lib/filters'
import { getExtendedLeadFieldValue } from '@/lib/lead-fields'
import type {
  Campaign,
  Deal,
  Lead,
  LeadSource,
  Role,
} from '@/types'

/** Which list a field's choices come from. */
export type FieldOptions =
  | 'sources'
  | 'statuses'
  | 'users'
  | 'teams'
  | 'campaigns'
  | 'pipelines'
  | 'stages'
  | 'priorities'
  | 'scoreCategories'
  | 'qualification'
  | 'leadTypes'
  | 'roles'
  | 'platforms'
  | 'tags'

export type AutomationFieldType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'multi-select'
  | 'user'
  | 'boolean'

export interface AutomationFieldDef {
  id: string
  label: string
  group: 'Lead' | 'Deal' | 'Owner' | 'Source' | 'Campaign' | 'Engagement' | 'Time'
  type: AutomationFieldType
  options?: FieldOptions
}

const lead = (id: string, label: string, type: AutomationFieldType, options?: FieldOptions): AutomationFieldDef => ({
  id,
  label,
  group: 'Lead',
  type,
  options,
})

const engagement = (signal: string, label: string): AutomationFieldDef => ({
  id: `engagement.${signal}`,
  label,
  group: 'Engagement',
  type: 'number',
})

/** Every field a condition can use. Custom fields (`custom.<key>`) are added per workspace. */
export const AUTOMATION_FIELDS: readonly AutomationFieldDef[] = [
  lead('name', 'Name', 'text'),
  lead('email', 'Email', 'text'),
  lead('phone', 'Phone', 'text'),
  lead('company', 'Company', 'text'),
  lead('location', 'Location', 'text'),
  lead('sourceId', 'Source', 'select', 'sources'),
  lead('campaignId', 'Campaign', 'select', 'campaigns'),
  lead('statusId', 'Status', 'select', 'statuses'),
  lead('pipelineId', 'Pipeline', 'select', 'pipelines'),
  lead('stageId', 'Stage', 'select', 'stages'),
  lead('assignedTo', 'Assigned to', 'user', 'users'),
  lead('teamId', 'Team', 'select', 'teams'),
  lead('score', 'Score', 'number'),
  lead('scoreCategory', 'Score category', 'select', 'scoreCategories'),
  lead('budget', 'Budget', 'currency'),
  lead('priority', 'Priority', 'select', 'priorities'),
  lead('tags', 'Tags', 'multi-select', 'tags'),
  lead('qualificationStatus', 'Qualification', 'select', 'qualification'),
  lead('productInterest', 'Product interest', 'text'),
  lead('leadType', 'Lead type', 'select', 'leadTypes'),
  lead('language', 'Language', 'text'),
  lead('createdAt', 'Created', 'date'),
  lead('lastContactedAt', 'Last contacted', 'date'),
  { id: 'deal.value', label: 'Deal value', group: 'Deal', type: 'currency' },
  { id: 'deal.stageId', label: 'Deal stage', group: 'Deal', type: 'select', options: 'stages' },
  { id: 'deal.pipelineId', label: 'Deal pipeline', group: 'Deal', type: 'select', options: 'pipelines' },
  { id: 'deal.product', label: 'Deal product', group: 'Deal', type: 'text' },
  { id: 'deal.probability', label: 'Deal probability', group: 'Deal', type: 'number' },
  { id: 'owner.teamId', label: 'Owner team', group: 'Owner', type: 'select', options: 'teams' },
  { id: 'owner.role', label: 'Owner role', group: 'Owner', type: 'select', options: 'roles' },
  { id: 'owner.location', label: 'Owner location', group: 'Owner', type: 'text' },
  { id: 'source.key', label: 'Source key', group: 'Source', type: 'text' },
  { id: 'campaign.platform', label: 'Campaign platform', group: 'Campaign', type: 'select', options: 'platforms' },
  engagement('whatsappReplies', 'WhatsApp replies'),
  engagement('emailOpens', 'Email opens'),
  engagement('demosAttended', 'Demos attended'),
  engagement('quotationRequests', 'Quotation requests'),
  engagement('formSubmissions', 'Form submissions'),
  engagement('websiteVisits', 'Website visits'),
  { id: 'time.businessHours', label: 'Within business hours', group: 'Time', type: 'boolean' },
]

const FIELD_BY_ID = new Map(AUTOMATION_FIELDS.map((field) => [field.id, field]))

export function findFieldDef(id: string): AutomationFieldDef | undefined {
  return FIELD_BY_ID.get(id)
}

export function isKnownField(id: string, customKeys: readonly string[] = []): boolean {
  return FIELD_BY_ID.has(id) || (id.startsWith('custom.') && customKeys.includes(id.slice(7)))
}

export function fieldLabel(id: string): string {
  if (id.startsWith('custom.')) return id.slice(7)
  return FIELD_BY_ID.get(id)?.label ?? id
}

/** Everything a condition may read: the trigger's entity and the entities related to it. */
export interface AutomationContext {
  now: Date
  lead: Lead | null
  deal: Deal | null
  owner: { id: string; role: Role; teamId: string | null; location: string | null } | null
  source: Pick<LeadSource, 'id' | 'key' | 'name'> | null
  campaign: Pick<Campaign, 'id' | 'platform' | 'name'> | null
  teamOf(userId: string): string | null
  withinBusinessHours: boolean
}

/** Value of a field in a context. Missing entities and unknown fields resolve to `undefined`. */
export function resolveAutomationField(field: string, ctx: AutomationContext): FieldValue {
  const [head, ...rest] = field.split('.')
  const key = rest.join('.')
  switch (head) {
    case 'deal':
      return ctx.deal ? dealValue(ctx.deal, key) : undefined
    case 'owner':
      return ctx.owner ? (ctx.owner as Record<string, FieldValue>)[key] : undefined
    case 'source':
      return ctx.source ? (ctx.source as Record<string, FieldValue>)[key] : undefined
    case 'campaign':
      return ctx.campaign ? (ctx.campaign as Record<string, FieldValue>)[key] : undefined
    case 'time':
      return key === 'businessHours' ? ctx.withinBusinessHours : undefined
    default:
      return ctx.lead
        ? getExtendedLeadFieldValue(ctx.lead, field, { now: ctx.now, teamOf: ctx.teamOf })
        : undefined
  }
}

function dealValue(deal: Deal, key: string): FieldValue {
  switch (key) {
    case 'value':
    case 'probability':
    case 'product':
    case 'stageId':
    case 'pipelineId':
      return deal[key]
    default:
      return undefined
  }
}
