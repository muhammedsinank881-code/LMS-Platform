import type { SettingsSection } from '@/types'

export interface SettingsLink {
  section: SettingsSection
  label: string
  description: string
  path: string
}

export const SETTINGS_LINKS: SettingsLink[] = [
  { section: 'profile', label: 'Profile', description: 'Your name, language and alerts.', path: '/settings/profile' },
  { section: 'workspace', label: 'Workspace', description: 'Name, currency, hours and fiscal year.', path: '/settings/workspace' },
  { section: 'statuses', label: 'Lead statuses', description: 'Names, colors and won or lost.', path: '/settings/statuses' },
  { section: 'pipelines', label: 'Pipelines & stages', description: 'Boards, probability and stage order.', path: '/settings/pipelines' },
  { section: 'sources', label: 'Lead sources', description: 'Where leads come from.', path: '/settings/sources' },
  { section: 'tags', label: 'Tags', description: 'Labels you can merge or remove.', path: '/settings/tags' },
  { section: 'custom_fields', label: 'Custom fields', description: 'Extra fields on leads, deals and customers.', path: '/settings/custom-fields' },
  { section: 'qualification', label: 'Qualification', description: 'Questions on the lead qualification tab.', path: '/settings/qualification' },
  { section: 'assignment', label: 'Assignment rules', description: 'Who receives a new lead.', path: '/settings/assignment' },
  { section: 'lost_reasons', label: 'Lost reasons', description: 'Why a lead or deal was lost.', path: '/settings/lost-reasons' },
  { section: 'billing', label: 'Billing & plan', description: 'Plan, usage and invoices.', path: '/settings/billing' },
  { section: 'scoring', label: 'Scoring rules', description: 'Points that heat a lead.', path: '/settings/scoring' },
  { section: 'templates', label: 'Message templates', description: 'WhatsApp and email templates.', path: '/settings/templates' },
  { section: 'integrations', label: 'Integrations', description: 'WhatsApp, ads and telephony.', path: '/settings/integrations' },
  { section: 'lead_capture', label: 'Lead capture', description: 'Forms that turn visitors into leads.', path: '/settings/lead-capture' },
  { section: 'api_keys', label: 'API keys & webhooks', description: 'Keys and outbound events.', path: '/settings/api-keys' },
]

export function settingsLink(section: SettingsSection): SettingsLink {
  const link = SETTINGS_LINKS.find((item) => item.section === section)
  if (!link) throw new Error(`Unknown settings section ${section}`)
  return link
}
