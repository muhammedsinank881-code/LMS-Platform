import { normalizeEmail } from '@/lib/duplicates'
import { normalizePhone } from '@/lib/phone'
import type { CustomersApiClient } from '@/services/api/customers'
import {
  createCustomerSchema,
  toCustomerId,
  updateCustomerSchema,
  type Company,
  type Customer,
  type CustomerFilterField,
} from '@/types'
import { request, type RequestContext } from '../core/context'
import { applyListParams, propertyValue, type ListSpec } from '../core/list-engine'
import { diffValues, recordAudit } from '../core/records'
import { newId } from '../core/util'
import { parseInput, validationError } from '../core/validate'

const FIELDS: readonly CustomerFilterField[] = [
  'name',
  'email',
  'phone',
  'ownerId',
  'companyId',
  'lifetimeValue',
  'createdAt',
  'tags',
]

function spec(ctx: RequestContext): ListSpec<Customer, CustomerFilterField> {
  return {
    fields: FIELDS,
    value: propertyValue,
    searchable(customer) {
      const company = customer.companyId ? ctx.db.find('companies', customer.companyId) : undefined
      return [customer.id, customer.name, customer.email, customer.phone, company?.name]
    },
    defaultSort: [{ field: 'createdAt', direction: 'desc' }],
    now: ctx.now,
  }
}

function requireCustomer(
  ctx: RequestContext,
  id: string,
  action: 'view' | 'edit' | 'delete',
): Customer {
  ctx.require('customers', action)
  const customer = ctx.db.get('customers', id, 'Customer')
  ctx.assertInScope('customers', customer.ownerId)
  return customer
}

function assertRefs(
  ctx: RequestContext,
  input: { companyId?: string | null; ownerId?: string },
): void {
  if (input.companyId && !ctx.db.find('companies', input.companyId)) {
    throw validationError('companyId', 'Select a valid company.')
  }
  if (input.ownerId && !ctx.db.find('users', input.ownerId)) {
    throw validationError('ownerId', 'Select a valid owner.')
  }
}

const text = (value: string | null | undefined) => value?.trim() || null

export const mockCustomersApi: CustomersApiClient = {
  list: (params) =>
    request((ctx) => {
      ctx.require('customers', 'view')
      const rows = ctx.db.all('customers').filter((c) => ctx.inScope('customers', c.ownerId))
      return applyListParams(rows, params, spec(ctx), 'customers')
    }),
  get: (id) => request((ctx) => requireCustomer(ctx, id, 'view')),
  create: (raw) =>
    request((ctx) => {
      ctx.require('customers', 'create')
      const input = parseInput(createCustomerSchema, raw)
      assertRefs(ctx, input)
      if (input.originLeadId) ctx.db.get('leads', input.originLeadId, 'Lead')
      const customer = ctx.db.insert('customers', {
        id: toCustomerId(ctx.db.nextNumber('customer')),
        name: input.name,
        phone: normalizePhone(input.phone),
        email: normalizeEmail(input.email),
        companyId: input.companyId ?? null,
        originLeadId: input.originLeadId ?? null,
        ownerId: input.ownerId ?? ctx.actor.id,
        lifetimeValue: input.lifetimeValue ?? 0,
        tags: input.tags ?? [],
        customFields: input.customFields ?? {},
        createdAt: ctx.timestamp,
        updatedAt: ctx.timestamp,
      })
      recordAudit(ctx, {
        action: 'created',
        entity: 'customer',
        entityId: customer.id,
        entityLabel: customer.name,
      })
      return customer
    }),
  update: (id, patch) =>
    request((ctx) => {
      const customer = requireCustomer(ctx, id, 'edit')
      const input = parseInput(updateCustomerSchema, patch)
      assertRefs(ctx, input)
      const saved = ctx.db.save('customers', {
        ...customer,
        ...(input.name && { name: input.name }),
        ...(input.phone !== undefined && { phone: normalizePhone(input.phone) }),
        ...(input.email !== undefined && { email: normalizeEmail(input.email) }),
        ...(input.companyId !== undefined && { companyId: input.companyId ?? null }),
        ...(input.ownerId && { ownerId: input.ownerId }),
        ...(input.lifetimeValue !== undefined && { lifetimeValue: input.lifetimeValue }),
        ...(input.tags && { tags: input.tags }),
        ...(input.customFields && { customFields: input.customFields }),
        updatedAt: ctx.timestamp,
      })
      const diff = diffValues(customer, saved, ['name', 'phone', 'email', 'ownerId', 'companyId'])
      if (diff) {
        recordAudit(ctx, {
          action: 'updated',
          entity: 'customer',
          entityId: id,
          entityLabel: saved.name,
          ...diff,
        })
      }
      return saved
    }),
  delete: (id) =>
    request((ctx) => {
      const customer = requireCustomer(ctx, id, 'delete')
      ctx.db.remove('customers', id)
      for (const lead of ctx.db.all('leads')) {
        if (lead.convertedToCustomerId === id) {
          ctx.db.save('leads', { ...lead, convertedToCustomerId: null })
        }
      }
      for (const deal of ctx.db.all('deals')) {
        if (deal.customerId === id) ctx.db.save('deals', { ...deal, customerId: null })
      }
      recordAudit(ctx, {
        action: 'deleted',
        entity: 'customer',
        entityId: id,
        entityLabel: customer.name,
      })
    }),

  getTimeline: (id) =>
    request((ctx) => {
      const customer = requireCustomer(ctx, id, 'view')
      if (!customer.originLeadId) return []
      return ctx.db
        .all('activities')
        .filter((a) => a.leadId === customer.originLeadId)
        .reverse()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }),

  listCompanies: (params) =>
    request((ctx) => {
      ctx.require('customers', 'view')
      return applyListParams(
        ctx.db.all('companies'),
        params,
        {
          fields: ['name', 'industry', 'city', 'createdAt'],
          value: propertyValue,
          searchable: (company) => [company.name, company.industry, company.city],
          defaultSort: [{ field: 'name', direction: 'asc' }],
          now: ctx.now,
        },
        'companies',
      )
    }),
  getCompany: (id) =>
    request((ctx) => {
      ctx.require('customers', 'view')
      return ctx.db.get('companies', id, 'Company')
    }),
  createCompany: (input) =>
    request((ctx) => {
      ctx.require('customers', 'create')
      const name = input.name?.trim()
      if (!name) throw validationError('name', 'Company name is required.')
      return ctx.db.insert('companies', {
        id: newId('company'),
        name,
        industry: text(input.industry),
        website: text(input.website),
        city: text(input.city),
        size: text(input.size),
        createdAt: ctx.timestamp,
      })
    }),
  updateCompany: (id, patch) =>
    request((ctx) => {
      ctx.require('customers', 'edit')
      const company: Company = ctx.db.get('companies', id, 'Company')
      return ctx.db.save('companies', {
        ...company,
        ...(patch.name?.trim() && { name: patch.name.trim() }),
        ...(patch.industry !== undefined && { industry: text(patch.industry) }),
        ...(patch.website !== undefined && { website: text(patch.website) }),
        ...(patch.city !== undefined && { city: text(patch.city) }),
        ...(patch.size !== undefined && { size: text(patch.size) }),
      })
    }),
}
