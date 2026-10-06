import type { CustomFieldDefinition, CustomFieldType, FormInputType, LeadCaptureField } from '@/types'

export const STANDARD_FIELD_LABEL: Record<LeadCaptureField, string> = {
  name: 'Full name',
  phone: 'Phone number',
  whatsapp: 'WhatsApp number',
  email: 'Email',
  company: 'Company',
  location: 'Location',
  productInterest: 'Product interest',
  budget: 'Budget',
  requirement: 'Requirement',
  language: 'Language',
}

export const STANDARD_FIELD_INPUT: Record<LeadCaptureField, FormInputType> = {
  name: 'text',
  phone: 'tel',
  whatsapp: 'tel',
  email: 'email',
  company: 'text',
  location: 'text',
  productInterest: 'text',
  budget: 'number',
  requirement: 'textarea',
  language: 'text',
}

export interface LeadFieldOption {
  value: string
  label: string
}

/** Every lead field a form or an ad-form mapping can point at: standard first, then custom (`custom.<key>`). */
export function leadFieldOptions(customFields: readonly Pick<CustomFieldDefinition, 'key' | 'label' | 'archived' | 'entity'>[] = []): LeadFieldOption[] {
  const standard = (Object.keys(STANDARD_FIELD_LABEL) as LeadCaptureField[]).map((key) => ({ value: key, label: STANDARD_FIELD_LABEL[key] }))
  const custom = customFields
    .filter((field) => field.entity === 'lead' && !field.archived)
    .map((field) => ({ value: `custom.${field.key}`, label: `${field.label} (custom)` }))
  return [...standard, ...custom]
}

const CUSTOM_INPUT: Partial<Record<CustomFieldType, FormInputType>> = {
  number: 'number',
  currency: 'number',
  dropdown: 'select',
  url: 'text',
}

/** The input type a lead field should render as by default. */
export function inputTypeFor(key: string, customFields: readonly Pick<CustomFieldDefinition, 'key' | 'type'>[] = []): FormInputType {
  if (key.startsWith('custom.')) return CUSTOM_INPUT[customFields.find((field) => `custom.${field.key}` === key)?.type ?? 'text'] ?? 'text'
  return STANDARD_FIELD_INPUT[key as LeadCaptureField] ?? 'text'
}
