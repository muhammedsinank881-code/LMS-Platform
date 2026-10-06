import type { CustomFieldDefinition, LeadForm, LeadFormField, LeadFormInput } from '@/types'
import { inputTypeFor, leadFieldOptions } from './fields'

let counter = 0
const fieldId = () => `fld-${Date.now().toString(36)}-${(counter += 1).toString(36)}`

export function newField(key: string, customFields: readonly CustomFieldDefinition[] = []): LeadFormField {
  const label = leadFieldOptions(customFields).find((option) => option.value === key)?.label.replace(' (custom)', '') ?? key
  const custom = customFields.find((field) => `custom.${field.key}` === key)
  return {
    id: fieldId(),
    key,
    label,
    placeholder: '',
    required: key === 'name',
    type: inputTypeFor(key, customFields),
    options: custom?.type === 'dropdown' ? custom.options : [],
    validation: {},
  }
}

export function defaultFormInput(sourceId: string | null, customFields: readonly CustomFieldDefinition[] = []): LeadFormInput {
  return {
    name: 'New lead form',
    fields: [newField('name', customFields), { ...newField('phone', customFields), required: true }, newField('email', customFields)],
    submitLabel: 'Submit',
    successMessage: 'Thank you! We will be in touch shortly.',
    redirectUrl: null,
    consentText: null,
    spamProtection: true,
    defaults: { sourceId, campaignId: null, statusId: null, tags: [], assignMode: 'rules', assignUserId: null },
    notifyUserIds: [],
    style: { accent: '#4f46e5', theme: 'light', rounded: true },
  }
}

export function toInput(form: LeadForm): LeadFormInput {
  return {
    name: form.name,
    fields: form.fields,
    submitLabel: form.submitLabel,
    successMessage: form.successMessage,
    redirectUrl: form.redirectUrl,
    consentText: form.consentText,
    spamProtection: form.spamProtection,
    defaults: form.defaults,
    notifyUserIds: form.notifyUserIds,
    style: form.style,
  }
}

export interface EmbedSnippets {
  link: string
  iframe: string
  script: string
}

/**
 * Ways to put a published form on a page. Both embeds forward the page's query string, so a
 * visitor arriving with `?utm_source=...` is attributed on the lead.
 */
export function embedSnippets(origin: string, formId: string, title: string): EmbedSnippets {
  const link = `${origin}/f/${formId}`
  const safeTitle = title.replace(/"/g, '&quot;')
  return {
    link,
    iframe: `<iframe src="${link}" title="${safeTitle}" width="100%" height="620" style="border:0;max-width:520px" loading="lazy"></iframe>`,
    script: [
      `<div id="leadflow-${formId}"></div>`,
      '<script>',
      '  (function () {',
      "    var frame = document.createElement('iframe');",
      `    frame.src = '${link}' + window.location.search;`,
      `    frame.title = '${title.replace(/['\\]/g, '')}';`,
      "    frame.style.cssText = 'border:0;width:100%;max-width:520px;height:620px';",
      `    document.getElementById('leadflow-${formId}').appendChild(frame);`,
      '  })();',
      '</script>',
    ].join('\n'),
  }
}
