import { applyFieldMapping, rawFromPayload } from '@/lib/ingest/field-mapping'
import { buildLeadInput, type ResolvedDefaults } from '@/lib/ingest/build-input'
import { PROVIDER_LABEL, PROVIDER_SOURCE_KEY } from '@/lib/ingest/providers'
import { pickRoundRobin } from '@/lib/ingest/round-robin'
import { matchCampaign } from '@/lib/ingest/utm'
import { ApiError } from '@/services/api/errors'
import {
  INTEGRATION_PROVIDER_LABEL,
  type IngestPayload,
  type IngestResult,
  type Lead,
  type LeadDefaults,
  type SourceContext,
} from '@/types'
import type { RequestContext } from '../core/context'
import { validationError } from '../core/validate'
import { logEvent } from '../integrations/support'
import { findLeadDuplicates, createLeadRecord } from '../resources/leads/create'

const BASE_DEFAULTS: Omit<LeadDefaults, 'sourceId'> = {
  campaignId: null,
  statusId: null,
  tags: [],
  assignMode: 'rules',
  assignUserId: null,
}

function resolveSourceId(ctx: RequestContext, source: SourceContext): string {
  if (source.defaults?.sourceId) return source.defaults.sourceId
  const key = PROVIDER_SOURCE_KEY[source.provider]
  const found = ctx.db.all('leadSources').find((row) => row.key === key)
  if (!found) throw validationError('sourceId', `Add a "${key}" lead source before receiving these leads.`)
  return found.id
}

/** A connected integration is required. An errored or expired one cannot receive leads. */
function requireWorkingIntegration(ctx: RequestContext, integrationId: string): void {
  const integration = ctx.db.find('integrations', integrationId)
  if (!integration) throw new ApiError('NOT_FOUND', 'Integration not found.')
  if (integration.status !== 'connected') {
    const label = INTEGRATION_PROVIDER_LABEL[integration.provider]
    throw new ApiError('CONFLICT', `${label} is ${integration.status === 'expired' ? 'expired' : 'not connected'}. Reconnect it to receive leads.`)
  }
}

function recordIntegrationLead(ctx: RequestContext, integrationId: string, lead: Lead): void {
  const integration = ctx.db.get('integrations', integrationId)
  const config = integration.config
  ctx.db.save('integrations', {
    ...integration,
    leadsReceived: integration.leadsReceived + 1,
    lastSyncAt: ctx.timestamp,
    config:
      config && 'forms' in config ? { ...config, lastLeadAt: ctx.timestamp } : config,
  })
  logEvent(ctx, integration, 'lead_received', `Lead ${lead.id} (${lead.name}) received`)
}

/**
 * The single entry point for every lead that arrives from outside: an ad platform, WhatsApp, a
 * hosted form, the API. It maps the provider's fields, captures UTM and matches the campaign, then
 * runs the same create pipeline as a manual lead (phone normalisation, duplicate check, scoring,
 * assignment rules, timeline "Lead created from <provider>", assignee notification, and the
 * lead.created event that automations and webhooks listen to).
 *
 * Callers authorise the work; run it in a system context so the lead is not attributed to a person.
 */
export function ingestLead(ctx: RequestContext, payload: IngestPayload, source: SourceContext): IngestResult {
  if (source.integrationId) requireWorkingIntegration(ctx, source.integrationId)

  const sourceId = resolveSourceId(ctx, source)
  const defaults: ResolvedDefaults = { ...BASE_DEFAULTS, ...source.defaults, sourceId }
  const customDefs = ctx.db.all('customFields').filter((field) => field.entity === 'lead')
  const mapped = applyFieldMapping(rawFromPayload(payload), source.mapping ?? [], customDefs)

  const utm = source.utm ?? {}
  const campaignId = matchCampaign(utm, ctx.db.all('campaigns'))
  const input = buildLeadInput(mapped, defaults, { campaignId })
  if (defaults.assignMode === 'round_robin') {
    input.assignedTo = pickRoundRobin(ctx.db.all('users'), ctx.db.all('leads'))
  }

  const created = createLeadRecord(ctx, input, { via: PROVIDER_LABEL[source.provider] })
  const lead = Object.keys(utm).length > 0 ? ctx.db.save('leads', { ...created, utm }) : created
  if (source.integrationId) recordIntegrationLead(ctx, source.integrationId, lead)

  return {
    leadId: lead.id,
    duplicates: findLeadDuplicates(ctx, lead).filter((match) => match.lead.id !== lead.id),
    assignedTo: lead.assignedTo,
    campaignMatched: campaignId !== null,
  }
}
