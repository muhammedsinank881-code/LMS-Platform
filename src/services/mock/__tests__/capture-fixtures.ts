import { request } from '@/services/mock/core/context'
import { systemActorContext } from '@/services/mock/core/system-actor'
import { subscribe } from '@/services/mock/automation/event-bus'
import { ingestLead } from '@/services/mock/ingest/ingest-lead'
import type { DomainEvent, IngestPayload, IngestResult, SourceContext } from '@/types'
import { ACME_TENANT_ID, tables } from './helpers'
import { must } from './inbox-fixtures'

/** Runs `ingestLead` in a system context, the way an integration or form would. */
export const ingest = (payload: IngestPayload, source: SourceContext): Promise<IngestResult> =>
  request((ctx) => ingestLead(systemActorContext(ctx, 'Test source'), payload, source))

export const sourceIdOf = (key: string): string =>
  must(tables().leadSources.find((row) => row.tenantId === ACME_TENANT_ID && row.key === key), `source ${key}`).id

export const leadById = (id: string) => must(tables().leads.find((lead) => lead.id === id), `lead ${id}`)

/** Collects bus events until the returned function is called. */
export function captureEvents(): { events: DomainEvent[]; stop: () => void } {
  const events: DomainEvent[] = []
  const stop = subscribe((_ctx, event) => void events.push(event))
  return { events, stop }
}

export const activitiesOf = (leadId: string) => tables().activities.filter((item) => item.leadId === leadId)
