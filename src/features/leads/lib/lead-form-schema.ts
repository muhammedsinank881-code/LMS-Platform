import { z } from 'zod'
import { createLeadSchema, updateLeadSchema } from '@/types'
import type { CustomFieldDefinition, CustomFieldValue } from '@/types'

function customFieldZod(def: CustomFieldDefinition): z.ZodType<CustomFieldValue | undefined> {
  const empty = z.union([z.literal(''), z.null(), z.undefined()])
  switch (def.type) {
    case 'number':
    case 'currency': {
      const number = z.number({ error: `${def.label} must be a number` })
      return def.required ? number : z.union([number, empty])
    }
    case 'boolean':
      return def.required ? z.boolean() : z.union([z.boolean(), empty])
    case 'multiselect': {
      const list = z.array(z.string())
      return def.required ? list.min(1, `Select at least one ${def.label}`) : list.optional()
    }
    case 'date':
    case 'url':
    case 'text':
    case 'dropdown':
    case 'file': {
      const text = z.string().trim()
      return def.required ? text.min(1, `${def.label} is required`) : z.union([text, empty])
    }
    default:
      return z.string().optional()
  }
}

export function leadFormSchema(defs: CustomFieldDefinition[], mode: 'create' | 'edit') {
  const customShape = Object.fromEntries(defs.map((def) => [def.key, customFieldZod(def)]))
  const customFields = z.object(customShape).partial()
  const base = mode === 'create' ? createLeadSchema : updateLeadSchema
  return base.and(z.object({ customFields: customFields.optional() }))
}

export type LeadFormValues = z.infer<typeof createLeadSchema>
