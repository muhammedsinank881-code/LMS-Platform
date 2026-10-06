import type { IntegrationsApiClient } from '@/services/api/integrations'
import { request, type RequestContext } from '../core/context'
import { requireSection } from '../core/section'
import { beginConnect, connect, disconnect, getIntegration, reconnect, updateConfig } from '../integrations/connect'
import { sendTestEmail, sendTestLead, syncSpend, syncTemplates, testCall, verifyWebhook } from '../integrations/actions'
import { ensureIntegrations, integrationId } from '../integrations/support'

const guard = (ctx: RequestContext) => requireSection(ctx, 'integrations')

export const mockIntegrationsApi: IntegrationsApiClient = {
  list: () =>
    request((ctx) => {
      guard(ctx)
      return ensureIntegrations(ctx)
    }),
  events: (provider) =>
    request((ctx) => {
      guard(ctx)
      const id = integrationId(provider)
      return ctx.db
        .all('integrationEvents')
        .filter((event) => event.integrationId === id)
        .sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id))
        .slice(0, 50)
    }),
  begin: (provider) => request((ctx) => (guard(ctx), beginConnect(ctx, provider))),
  connect: (input) => request((ctx) => (guard(ctx), connect(ctx, input))),
  update: (provider, input) => request((ctx) => (guard(ctx), updateConfig(ctx, provider, input))),
  reconnect: (provider) => request((ctx) => (guard(ctx), reconnect(ctx, provider))),
  disconnect: (provider) => request((ctx) => (guard(ctx), disconnect(ctx, provider))),
  verifyWebhook: () => request((ctx) => (guard(ctx), verifyWebhook(ctx))),
  syncTemplates: () => request((ctx) => (guard(ctx), syncTemplates(ctx))),
  sendTestEmail: (to) => request((ctx) => (guard(ctx), sendTestEmail(ctx, to))),
  sendTestLead: (provider, formId) => request((ctx) => (guard(ctx), sendTestLead(ctx, provider, formId))),
  testCall: () => request((ctx) => (guard(ctx), testCall(ctx))),
  syncSpend: () => request((ctx) => (guard(ctx), syncSpend(ctx))),
}

export { getIntegration }
