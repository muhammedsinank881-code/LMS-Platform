import type { Lead, User } from '@/types'

export const CORE_TEMPLATE_VARIABLES = [
  'lead.name',
  'lead.company',
  'lead.phone',
  'lead.email',
  'owner.name',
  'company.name',
] as const

export type CoreTemplateVariable = (typeof CORE_TEMPLATE_VARIABLES)[number]

export const TEMPLATE_VARIABLE_LABEL: Record<CoreTemplateVariable, string> = {
  'lead.name': 'Lead name',
  'lead.company': 'Lead company',
  'lead.phone': 'Lead phone',
  'lead.email': 'Lead email',
  'owner.name': 'Owner name',
  'company.name': 'Your company',
}

export const CUSTOM_VARIABLE_PREFIX = 'lead.custom.'

const PLACEHOLDER = /\{\{([a-zA-Z][\w.]*)\}\}/g

export function customVariable(key: string): string {
  return `${CUSTOM_VARIABLE_PREFIX}${key}`
}

export function parseTemplateVariables(text: string): string[] {
  return [...new Set([...text.matchAll(PLACEHOLDER)].map((match) => match[1]))]
}

/** Core variables, plus `lead.custom.<key>` only for custom fields that exist on the workspace. */
export function isAllowedTemplateVariable(name: string, customKeys: readonly string[] = []): boolean {
  if ((CORE_TEMPLATE_VARIABLES as readonly string[]).includes(name)) return true
  if (!name.startsWith(CUSTOM_VARIABLE_PREFIX)) return false
  return customKeys.includes(name.slice(CUSTOM_VARIABLE_PREFIX.length))
}

export function validateTemplateVariables(
  text: string,
  customKeys: readonly string[] = [],
): { variables: string[]; unknown: string[] } {
  const variables = parseTemplateVariables(text)
  return {
    variables,
    unknown: variables.filter((name) => !isAllowedTemplateVariable(name, customKeys)),
  }
}

/** WhatsApp rejects templates whose body starts or ends with a placeholder. */
export function templateEdgeVariableError(body: string): string | null {
  const text = body.trim()
  if (/^\{\{[^}]+\}\}/.test(text) || /\{\{[^}]+\}\}[.!?]?$/.test(text)) {
    return 'The body cannot start or end with a variable. Add some text before or after it.'
  }
  return null
}

export interface TemplateRenderContext {
  lead?: Pick<Lead, 'name' | 'company' | 'phone' | 'email' | 'customFields'> | null
  owner?: Pick<User, 'name'> | null
  /** The workspace's own company name, for {{company.name}}. */
  companyName?: string | null
  /** Values typed by the sender or sample values. They win over lead data. */
  fallbacks?: Record<string, string>
}

export interface TemplateRenderResult {
  text: string
  missing: string[]
}

export function templateValue(name: string, ctx: TemplateRenderContext): string | null {
  const fallback = ctx.fallbacks?.[name]
  if (fallback) return fallback
  switch (name) {
    case 'lead.name':
      return ctx.lead?.name || null
    case 'lead.company':
      return ctx.lead?.company || null
    case 'lead.phone':
      return ctx.lead?.phone || null
    case 'lead.email':
      return ctx.lead?.email || null
    case 'owner.name':
      return ctx.owner?.name || null
    case 'company.name':
      return ctx.companyName || null
    default:
      break
  }
  if (name.startsWith(CUSTOM_VARIABLE_PREFIX) && ctx.lead) {
    const raw = ctx.lead.customFields[name.slice(CUSTOM_VARIABLE_PREFIX.length)]
    if (raw === null || raw === undefined || raw === '') return null
    return Array.isArray(raw) ? raw.join(', ') : String(raw)
  }
  return null
}

/** Fills every placeholder. Missing values render blank and are listed in `missing`. */
export function renderTemplate(text: string, ctx: TemplateRenderContext): TemplateRenderResult {
  const missing: string[] = []
  const rendered = text.replace(PLACEHOLDER, (_full, name: string) => {
    const value = templateValue(name, ctx)
    if (value === null) {
      missing.push(name)
      return ''
    }
    return value
  })
  return { text: rendered, missing: [...new Set(missing)] }
}
