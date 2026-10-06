import type { Lead, WebhookDeliveryEvent, WebhookEvent } from '@/types'

export interface WebhookEnvelope {
  id: string
  type: WebhookDeliveryEvent
  createdAt: string
  data: Record<string, unknown>
}

export function buildEnvelope(
  id: string,
  type: WebhookDeliveryEvent,
  createdAt: string,
  data: Record<string, unknown>,
): WebhookEnvelope {
  return { id, type, createdAt, data }
}

interface LeadLookups {
  sourceName: (id: string) => string
  statusName: (id: string) => string
}

/** The lead as an integration sees it: stable ids and names, no internal scoring or audit fields. */
export function leadData(lead: Lead, lookups: LeadLookups): Record<string, unknown> {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    company: lead.company,
    source: lookups.sourceName(lead.sourceId),
    status: lookups.statusName(lead.statusId),
    score: lead.score,
    scoreCategory: lead.scoreCategory,
    assignedTo: lead.assignedTo,
    tags: lead.tags,
    utm: lead.utm ?? null,
    createdAt: lead.createdAt,
  }
}

const SAMPLE_LEAD = {
  id: 'L-10231',
  name: 'Aarav Sharma',
  phone: '+919876543210',
  email: 'aarav@example.com',
  company: 'Sharma Traders',
  source: 'Facebook',
  status: 'New',
  score: 62,
  scoreCategory: 'warm',
  assignedTo: 'user-ananya',
  tags: ['festive-offer'],
  utm: { source: 'facebook', campaign: 'diwali-dhamaka' },
  createdAt: '2026-10-04T06:00:00.000Z',
}

const SAMPLE_DATA: Record<WebhookEvent, Record<string, unknown>> = {
  'lead.created': { lead: SAMPLE_LEAD },
  'lead.updated': { lead: SAMPLE_LEAD, changedFields: ['budget', 'tags'] },
  'lead.assigned': { lead: SAMPLE_LEAD, toUserId: 'user-ananya' },
  'lead.status_changed': { lead: SAMPLE_LEAD, fromStatusId: 'status-new', toStatusId: 'status-qualified' },
  'lead.converted': { lead: SAMPLE_LEAD, customerId: 'C-1042' },
  'deal.won': { deal: { id: 'D-1007', value: 250000, leadId: 'L-10231' } },
  'deal.lost': { deal: { id: 'D-1008', value: 90000, leadId: 'L-10232' }, lostReason: 'Price too high' },
  'conversation.message_received': { lead: SAMPLE_LEAD, channel: 'whatsapp', preview: 'Can you share pricing?' },
}

/** A realistic example payload for docs, the payload reference and "Send test event". */
export function samplePayload(event: WebhookEvent, createdAt = '2026-10-04T06:00:00.000Z'): WebhookEnvelope {
  return buildEnvelope('evt_sample_0001', event, createdAt, SAMPLE_DATA[event])
}
