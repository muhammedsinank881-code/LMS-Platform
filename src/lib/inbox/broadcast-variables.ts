import type { VariableMap } from '@/types'
import {
  isAllowedTemplateVariable,
  renderTemplate,
  templateValue,
  type TemplateRenderContext,
} from './template-variables'

export const TEXT_PREFIX = 'text:'

export const isFixedText = (mapping: string) => mapping.startsWith(TEXT_PREFIX)
export const fixedText = (mapping: string) => mapping.slice(TEXT_PREFIX.length)

/** The default mapping: each template variable reads the lead field of the same name when it can. */
export function defaultVariableMap(variables: readonly string[], customKeys: readonly string[] = []): VariableMap {
  return Object.fromEntries(
    variables.map((name) => [name, isAllowedTemplateVariable(name, customKeys) ? name : TEXT_PREFIX]),
  )
}

/**
 * One message per template variable: it must be mapped to a lead field the workspace has, or to
 * non-empty fixed text. Returns an error per variable, empty when the map is valid.
 */
export function validateVariableMap(
  variables: readonly string[],
  map: VariableMap,
  customKeys: readonly string[] = [],
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const name of variables) {
    const mapping = map[name]?.trim()
    if (!mapping) errors[name] = 'Map this variable to a lead field or enter text.'
    else if (isFixedText(mapping)) {
      if (!fixedText(mapping).trim()) errors[name] = 'Enter the text to send.'
    } else if (!isAllowedTemplateVariable(mapping, customKeys)) {
      errors[name] = 'That lead field does not exist.'
    }
  }
  return errors
}

/** Fills a template body for one lead using the variable map. Unresolved values render blank. */
export function renderBroadcastBody(
  body: string,
  map: VariableMap,
  context: TemplateRenderContext,
): { text: string; missing: string[] } {
  const fallbacks: Record<string, string> = {}
  for (const [name, mapping] of Object.entries(map)) {
    const value = isFixedText(mapping) ? fixedText(mapping) : templateValue(mapping, { ...context, fallbacks: {} })
    if (value) fallbacks[name] = value
  }
  return renderTemplate(body, { ...context, fallbacks })
}
