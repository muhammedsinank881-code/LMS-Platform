import { normalizeEmail } from '@/lib/duplicates'
import { normalizePhone } from '@/lib/phone'
import { ApiError } from '@/services/api/errors'
import type { ConvertToCustomerInput, ConvertToCustomerResult } from '@/services/api/leads'
import { createDealSchema, toCustomerId, type Company, type Lead, type LeadId } from '@/types'
import type { RequestContext } from '../../core/context'
import { emit } from '../../automation/event-bus'
import { recordActivity, recordAudit } from '../../core/records'
import { newId } from '../../core/util'
import { parseInput, validationError } from '../../core/validate'
import { createDealRecord } from '../deals'
import { requireLead } from './access'
import { applyStatusChange } from './changes'

function companyFor(ctx: RequestContext, name: string | null, city: string | null): Company | null {
  if (!name) return null
  const existing = ctx.db.all('companies').find((c) => c.name.toLowerCase() === name.toLowerCase())
  if (existing) return existing
  return ctx.db.insert('companies', {
    id: newId('company'),
    name,
    industry: null,
    website: null,
    city,
    size: null,
    createdAt: ctx.timestamp,
  })
}

function textOrFallback(value: string | null | undefined, fallback: string | null): string | null {
  if (value === undefined) return fallback
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** Creates a customer from a lead without the customers.create check. Winning a deal uses this. */
export function createCustomerFromLead(
  ctx: RequestContext,
  id: LeadId,
  input?: ConvertToCustomerInput,
): ConvertToCustomerResult {
  const lead = requireLead(ctx, id, 'edit')
  if (lead.convertedToCustomerId) {
    throw new ApiError('CONFLICT', `${lead.name} has already been converted to a customer.`)
  }

  if (input?.statusId) {
    const status = ctx.db.find('leadStatuses', input.statusId)
    if (!status || status.type !== 'won') {
      throw validationError('statusId', 'Choose a won status.')
    }
  }
  if (input?.deal) parseInput(createDealSchema, { ...input.deal, leadId: lead.id })

  const name = input?.name?.trim() || lead.name
  const phone = input?.phone === undefined ? lead.phone : normalizePhone(input.phone)
  const email = input?.email === undefined ? lead.email : normalizeEmail(input.email)
  const companyName = textOrFallback(input?.companyName, lead.company)
  const location = textOrFallback(input?.location, lead.location)
  const company = companyFor(ctx, companyName, location)

  const customer = ctx.db.insert('customers', {
    id: toCustomerId(ctx.db.nextNumber('customer')),
    name,
    phone,
    email,
    companyId: company?.id ?? null,
    originLeadId: lead.id,
    ownerId: lead.assignedTo ?? ctx.actor.id,
    lifetimeValue: 0,
    tags: [...lead.tags],
    customFields: { ...lead.customFields },
    createdAt: ctx.timestamp,
    updatedAt: ctx.timestamp,
  })
  let saved: Lead = ctx.db.save('leads', {
    ...lead,
    convertedToCustomerId: customer.id,
    updatedAt: ctx.timestamp,
  })
  const deal = input?.deal ? createDealRecord(ctx, { ...input.deal, leadId: lead.id }) : null
  if (input?.statusId && input.statusId !== saved.statusId) {
    saved = applyStatusChange(ctx, saved, { statusId: input.statusId })
  }
  recordActivity(ctx, saved.id, { type: 'converted', data: { customerId: customer.id } })
  recordAudit(ctx, {
    action: 'converted',
    entity: 'customer',
    entityId: customer.id,
    entityLabel: customer.name,
    previousValue: { lead: saved.id },
    newValue: { customer: customer.id },
  })
  emit(ctx, { type: 'lead_converted', entity: { kind: 'lead', id: saved.id } })
  return { lead: saved, customer, company, deal }
}

/** Creates a customer (and its company) from a lead. The lead and its history are kept and linked. */
export function convertToCustomer(
  ctx: RequestContext,
  id: LeadId,
  input?: ConvertToCustomerInput,
): ConvertToCustomerResult {
  ctx.require('customers', 'create')
  return createCustomerFromLead(ctx, id, input)
}
