import type { SimulatorApiClient } from '@/services/api/simulator'
import type { LeadForm } from '@/types'
import { request } from '../core/context'
import { getMockState } from '../core/state'
import { systemActorContext } from '../core/system-actor'
import { failIntegration, sampleValue, sendTestLead, syncSpend } from '../integrations/actions'
import { ingestLead } from '../ingest/ingest-lead'
import { ensureConversation, insertInboundMessage, resolveIncomingContact } from './conversation-incoming'
import { submitPublicForm } from './lead-forms-public'

type CaptureSimulator = Pick<
  SimulatorApiClient,
  'adLead' | 'captureFormSubmission' | 'whatsappLead' | 'setWebhookOutcome' | 'failIntegration' | 'syncSpend'
>

function sampleValues(form: LeadForm): Record<string, string> {
  const seq = String(Date.now() % 100_000_000)
  return Object.fromEntries(
    form.fields.map((field) => {
      if (field.type === 'select') return [field.key, field.options[0] ?? '']
      if (field.type === 'number') return [field.key, String(field.validation.min ?? 5)]
      if (field.type === 'email') return [field.key, `visitor.${seq}@example.com`]
      if (field.type === 'tel') return [field.key, sampleValue('phone', seq)]
      return [field.key, sampleValue(field.key, seq)]
    }),
  )
}

/** Dev-only controls for the integrations, forms and webhooks. Nothing here checks permissions. */
export const captureSimulator: CaptureSimulator = {
  adLead: (provider) => request((ctx) => sendTestLead(ctx, provider)),
  captureFormSubmission: async (formId, utm) => {
    const form = await request((ctx) => ctx.db.get('leadForms', formId, 'Form'))
    return submitPublicForm(formId, { values: sampleValues(form), utm, consent: true })
  },
  whatsappLead: (phone, text) =>
    request((ctx) => {
      const whatsapp = ctx.db.all('integrations').find((row) => row.provider === 'whatsapp' && row.status === 'connected')
      const result = ingestLead(systemActorContext(ctx, 'WhatsApp'), { shape: 'whatsapp', from: phone, text }, {
        provider: 'whatsapp',
        integrationId: whatsapp?.id ?? null,
      })
      const contact = resolveIncomingContact(ctx, { phone })
      const conversation = ensureConversation(ctx, 'whatsapp', contact.lead, contact.phone, contact.email)
      insertInboundMessage(ctx, conversation, { body: text })
      return { leadId: result.leadId, duplicate: result.duplicates.length > 0 }
    }),
  setWebhookOutcome: (outcome) =>
    request(() => {
      getMockState().webhookOutcome = outcome
    }),
  failIntegration: (provider, kind) => request((ctx) => failIntegration(ctx, provider, kind)),
  syncSpend: () => request((ctx) => syncSpend(ctx)),
}
