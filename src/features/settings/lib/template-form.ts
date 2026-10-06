import { z } from 'zod'
import { TEMPLATE_BUTTON_KINDS, TEMPLATE_CATEGORIES, TEMPLATE_CHANNELS, type MessageTemplate, type TemplateInput } from '@/types'

export const MAX_BUTTONS = 3
export const WHATSAPP_BODY_LIMIT = 1024

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'mr', label: 'Marathi' },
  { value: 'bn', label: 'Bengali' },
] as const

export const templateFormSchema = z.object({
  name: z.string().trim().min(2, 'Give the template a name').max(80),
  channel: z.enum(TEMPLATE_CHANNELS),
  category: z.enum(TEMPLATE_CATEGORIES),
  language: z.string().min(2),
  subject: z.string().max(200).optional(),
  header: z.string().max(60, 'Headers can be 60 characters at most').optional(),
  body: z.string().trim().min(1, 'Write the message'),
  footer: z.string().max(60, 'Footers can be 60 characters at most').optional(),
  buttons: z
    .array(
      z.object({
        kind: z.enum(TEMPLATE_BUTTON_KINDS),
        label: z.string().trim().min(1, 'Label the button').max(25, 'Up to 25 characters'),
        value: z.string().trim().optional(),
      }),
    )
    .max(MAX_BUTTONS),
  sampleValues: z.record(z.string(), z.string()),
})

export type TemplateFormValues = z.infer<typeof templateFormSchema>

export function templateDefaults(template: MessageTemplate | null): TemplateFormValues {
  return {
    name: template?.name ?? '',
    channel: template?.channel ?? 'whatsapp',
    category: template?.category ?? 'utility',
    language: template?.language ?? 'en',
    subject: template?.subject ?? '',
    header: template?.header ?? '',
    body: template?.body ?? '',
    footer: template?.footer ?? '',
    buttons: (template?.buttons ?? []).map((button) => ({
      kind: button.kind,
      label: button.label,
      value: button.kind === 'url' ? (button.url ?? '') : button.kind === 'call' ? (button.phone ?? '') : '',
    })),
    sampleValues: template?.sampleValues ?? {},
  }
}

export function toTemplateInput(values: TemplateFormValues): TemplateInput {
  const whatsapp = values.channel === 'whatsapp'
  return {
    name: values.name,
    channel: values.channel,
    category: values.category,
    language: values.language,
    body: values.body,
    subject: values.channel === 'email' ? values.subject || null : null,
    header: whatsapp ? values.header || null : null,
    footer: whatsapp ? values.footer || null : null,
    buttons: whatsapp
      ? values.buttons.map((button) => ({
          kind: button.kind,
          label: button.label,
          url: button.kind === 'url' ? button.value || null : null,
          phone: button.kind === 'call' ? button.value || null : null,
        }))
      : [],
    sampleValues: values.sampleValues,
  }
}
