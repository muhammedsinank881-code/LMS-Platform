import type { ApiScope, CreateLeadInput, Lead, Paginated, UpdateLeadInput } from '@/types'

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export interface EndpointDoc {
  id: string
  method: HttpMethod
  path: string
  summary: string
  scope: ApiScope
  /** Query parameters, name to description. */
  query?: Record<string, string>
  requestExample?: unknown
  status: number
  responseExample?: unknown
}

export interface EndpointGroup {
  id: string
  title: string
  endpoints: EndpointDoc[]
}

// The examples below are typed against the same interfaces the `services/api` clients use, so a
// change to a lead field that breaks the contract breaks the build here too.
const leadExample = {
  id: 'L-10231',
  name: 'Aarav Sharma',
  phone: '+919876543210',
  email: 'aarav@example.com',
  company: 'Sharma Traders',
  sourceId: 'source-facebook',
  statusId: 'status-new',
  assignedTo: 'user-ananya',
  score: 62,
  scoreCategory: 'warm',
  tags: ['festive-offer'],
  createdAt: '2026-10-04T06:00:00.000Z',
} satisfies Partial<Lead>

const createLeadExample = {
  name: 'Aarav Sharma',
  phone: '+919876543210',
  email: 'aarav@example.com',
  sourceId: 'source-api',
  tags: ['festive-offer'],
} satisfies CreateLeadInput

const updateLeadExample = { statusId: 'status-qualified', budget: 250000 } satisfies UpdateLeadInput

const page = {
  items: [leadExample],
  total: 1,
  page: 1,
  pageSize: 25,
  pageCount: 1,
} satisfies Paginated<typeof leadExample>

const deal = { id: 'D-1007', leadId: 'L-10231', title: 'Modular kitchen', value: 250000, stageId: 'stage-proposal', expectedCloseDate: '2026-11-15' }
const followUp = { id: 'follow-1', leadId: 'L-10231', type: 'call', dueAt: '2026-10-06T09:30:00.000Z', status: 'pending', assignedTo: 'user-ananya' }
const webhook = { id: 'wh-1', url: 'https://hooks.example.com/leadflow', events: ['lead.created'], enabled: true }

/** The target REST contract. Order here is the order of the page. */
export const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    id: 'leads',
    title: 'Leads',
    endpoints: [
      { id: 'leads-create', method: 'POST', path: '/api/leads', summary: 'Create a lead. Runs duplicate detection, scoring and assignment, like a manual lead.', scope: 'leads:write', requestExample: createLeadExample, status: 201, responseExample: leadExample },
      { id: 'leads-list', method: 'GET', path: '/api/leads', summary: 'List leads you can see, newest first.', scope: 'leads:read', query: { page: 'Page number, from 1.', pageSize: 'Items per page, up to 100.', search: 'Matches name, phone, email and company.', sourceId: 'Only leads from this source.', statusId: 'Only leads in this status.' }, status: 200, responseExample: page },
      { id: 'leads-get', method: 'GET', path: '/api/leads/:id', summary: 'Fetch one lead.', scope: 'leads:read', status: 200, responseExample: leadExample },
      { id: 'leads-update', method: 'PATCH', path: '/api/leads/:id', summary: 'Change fields on a lead. Send only what changes.', scope: 'leads:write', requestExample: updateLeadExample, status: 200, responseExample: { ...leadExample, statusId: 'status-qualified', budget: 250000 } },
      { id: 'leads-delete', method: 'DELETE', path: '/api/leads/:id', summary: 'Delete a lead. This cannot be undone.', scope: 'leads:write', status: 204 },
    ],
  },
  {
    id: 'deals',
    title: 'Deals',
    endpoints: [
      { id: 'deals-list', method: 'GET', path: '/api/deals', summary: 'List deals.', scope: 'deals:read', query: { page: 'Page number, from 1.', stageId: 'Only deals in this stage.' }, status: 200, responseExample: { items: [deal], total: 1, page: 1, pageSize: 25, pageCount: 1 } },
      { id: 'deals-create', method: 'POST', path: '/api/deals', summary: 'Create a deal for a lead.', scope: 'deals:write', requestExample: { leadId: 'L-10231', title: 'Modular kitchen', value: 250000, stageId: 'stage-proposal' }, status: 201, responseExample: deal },
    ],
  },
  {
    id: 'followups',
    title: 'Follow-ups',
    endpoints: [
      { id: 'followups-list', method: 'GET', path: '/api/follow-ups', summary: 'List follow-ups, soonest first.', scope: 'followups:read', query: { status: 'pending, done or overdue.', assignedTo: 'A user id.' }, status: 200, responseExample: { items: [followUp], total: 1, page: 1, pageSize: 25, pageCount: 1 } },
      { id: 'followups-create', method: 'POST', path: '/api/follow-ups', summary: 'Schedule a follow-up on a lead.', scope: 'followups:write', requestExample: { leadId: 'L-10231', type: 'call', dueAt: '2026-10-06T09:30:00.000Z' }, status: 201, responseExample: followUp },
    ],
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    endpoints: [
      { id: 'webhooks-list', method: 'GET', path: '/api/webhooks', summary: 'List your webhook endpoints. Signing secrets are never returned.', scope: 'webhooks:manage', status: 200, responseExample: { items: [webhook] } },
      { id: 'webhooks-create', method: 'POST', path: '/api/webhooks', summary: 'Register an endpoint. The response includes the signing secret once.', scope: 'webhooks:manage', requestExample: { url: 'https://hooks.example.com/leadflow', events: ['lead.created', 'deal.won'] }, status: 201, responseExample: { ...webhook, secret: 'whsec_••••••••••••••••••••••••a1B2' } },
      { id: 'webhooks-delete', method: 'DELETE', path: '/api/webhooks/:id', summary: 'Remove an endpoint and its delivery history.', scope: 'webhooks:manage', status: 204 },
    ],
  },
]

export const ERROR_CODES: Array<{ status: number; code: string; meaning: string }> = [
  { status: 400, code: 'VALIDATION', meaning: 'The body is invalid. `fieldErrors` names each field.' },
  { status: 401, code: 'unauthorized', meaning: 'The key is missing, wrong, revoked or expired.' },
  { status: 403, code: 'FORBIDDEN', meaning: 'The key lacks the scope this endpoint needs, or the IP is not allowed.' },
  { status: 404, code: 'NOT_FOUND', meaning: 'No such record in your workspace.' },
  { status: 409, code: 'CONFLICT', meaning: 'The action clashes with the record state, such as an already converted lead.' },
  { status: 429, code: 'RATE_LIMITED', meaning: 'Too many requests. Wait for `Retry-After` seconds.' },
]
