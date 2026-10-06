import { toCustomerId, toDealId, type Company, type Customer, type Deal, type Lead } from '@/types'
import { STATUS_DEFS } from './config-data'
import { assignableUsers, type SeedContext, type SeedSales } from './context'
import { INDUSTRIES } from './indian-data'
import { DAY, HOUR, int, pick, sample, scaled, seedId, shuffle, type SeedEnv } from './rng'

/** Which pipeline stage a lead in a given status sits in. Statuses not listed have no deal. */
const STAGE_FOR_STATUS: Record<string, string> = {
  interested: 'qualified',
  qualified: 'qualified',
  demo: 'qualified',
  proposal: 'proposal',
  negotiation: 'negotiation',
  won: 'won',
  lost: 'lost',
}

/** How many deals to aim for per stage (out of 40 in the full dataset). */
const STAGE_QUOTAS: Array<[stage: string, count: number]> = [
  ['won', 14],
  ['lost', 6],
  ['negotiation', 7],
  ['proposal', 7],
  ['qualified', 6],
]

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const

const roundTo = (value: number, step: number) => Math.max(step, Math.round(value / step) * step)

/**
 * Builds deals from leads that are far enough along, plus the customers and companies behind
 * the won ones. Won leads are kept and linked to their customer (`convertedToCustomerId`),
 * which is why this mutates the leads it is given.
 */
export function buildSales(env: SeedEnv, ctx: SeedContext): SeedSales {
  const { config, leads, bases, users } = ctx
  const slugOf = new Map(STATUS_DEFS.map(([slug]) => [seedId(env, 'status', slug), slug]))
  const stageById = (slug: string) => seedId(env, 'stage', slug)
  const pipelineId = config.pipelines[0].id
  const now = env.now.getTime()

  const eligible = leads.filter((lead) => !lead.archivedAt && lead.assignedTo !== null)
  const pools = new Map<string, Lead[]>()
  for (const lead of shuffle(env, eligible)) {
    const stage = STAGE_FOR_STATUS[slugOf.get(lead.statusId) ?? '']
    if (!stage) continue
    pools.set(stage, [...(pools.get(stage) ?? []), lead])
  }

  const target = scaled(env, 40, 6)
  const picked: Array<{ lead: Lead; stage: string }> = []
  const taken = new Set<string>()
  const take = (stage: string, count: number) => {
    for (const lead of (pools.get(stage) ?? []).filter((l) => !taken.has(l.id)).slice(0, count)) {
      taken.add(lead.id)
      picked.push({ lead, stage })
    }
  }
  const quotaScale = target / 40
  for (const [stage, count] of STAGE_QUOTAS)
    take(stage, Math.max(1, Math.round(count * quotaScale)))
  // Top up from any stage that still has leads, so the total lands on target when it can.
  for (const [stage] of shuffle(env, STAGE_QUOTAS)) {
    if (picked.length >= target) break
    take(stage, target - picked.length)
  }

  const companies = new Map<string, Company>()
  const companyFor = (lead: Lead): Company | null => {
    if (!lead.company) return null
    const existing = companies.get(lead.company)
    if (existing) return existing
    const slug = lead.company
      .toLowerCase()
      .replace(/ (pvt ltd|llp|enterprises|& sons)$/, '')
      .replace(/[^a-z0-9]+/g, '')
    const company: Company = {
      id: seedId(env, 'company', companies.size + 1),
      tenantId: env.tenantId,
      name: lead.company,
      industry: pick(env, INDUSTRIES),
      website: `https://www.${slug}.in`,
      city: lead.location,
      size: pick(env, COMPANY_SIZES),
      createdAt: lead.createdAt,
    }
    companies.set(lead.company, company)
    return company
  }

  const owners = assignableUsers(users)
  const customers = new Map<string, Customer>()
  const deals: Array<Omit<Deal, 'id'>> = picked.map(({ lead, stage }) => {
    const stageRow = config.stages.find((s) => s.id === stageById(stage))
    const probability = stageRow?.probability ?? 0
    const value = roundTo(lead.budget ?? int(env, 40, 600) * 1000, 5000)
    const created = Math.min(now - HOUR, Date.parse(lead.createdAt) + int(env, 2 * HOUR, 6 * DAY))
    const closed = stage === 'won' || stage === 'lost'
    const closedAt = closed
      ? Math.min(now - HOUR, Math.max(created + HOUR, Date.parse(lead.updatedAt)))
      : null
    return {
      tenantId: env.tenantId,
      title: `${lead.productInterest ?? 'Services'} for ${lead.company ?? lead.name}`,
      leadId: lead.id,
      customerId: null,
      value,
      expectedCloseDate: new Date(closedAt ?? now + int(env, 5, 60) * DAY).toISOString(),
      probability,
      product: lead.productInterest ?? 'Services',
      ownerId: lead.assignedTo ?? pick(env, owners).id,
      pipelineId,
      stageId: stageById(stage),
      position: 0,
      stageEnteredAt: new Date(created).toISOString(),
      expectedRevenue: Math.round((value * probability) / 100),
      lostReasonId: stage === 'lost' ? (lead.lostReasonId ?? null) : null,
      customFields: {},
      closedAt: closedAt === null ? null : new Date(closedAt).toISOString(),
      createdAt: new Date(created).toISOString(),
      updatedAt: new Date(
        closedAt ?? Math.min(now, created + int(env, HOUR, 4 * DAY)),
      ).toISOString(),
    }
  })
  deals.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  // Every won lead becomes a customer, whether or not a deal was drawn for it.
  const wonLeads = leads.filter(
    (lead) => !lead.archivedAt && slugOf.get(lead.statusId) === 'won' && lead.assignedTo !== null,
  )
  wonLeads.forEach((lead, index) => {
    const company = companyFor(lead)
    customers.set(lead.id, {
      id: toCustomerId(bases.customer + index + 1),
      tenantId: env.tenantId,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      companyId: company?.id ?? null,
      originLeadId: lead.id,
      ownerId: lead.assignedTo ?? pick(env, owners).id,
      lifetimeValue: 0,
      tags: sample(env, lead.tags, 1),
      customFields: {},
      createdAt: lead.updatedAt,
      updatedAt: lead.updatedAt,
    })
    lead.convertedToCustomerId = toCustomerId(bases.customer + index + 1)
  })

  const withIds: Deal[] = deals.map((deal, index) => {
    const customer = customers.get(deal.leadId)
    const won = deal.stageId === stageById('won')
    if (customer && won) customer.lifetimeValue += deal.value
    return {
      ...deal,
      id: toDealId(bases.deal + index + 1),
      customerId: customer && won ? customer.id : null,
    }
  })
  const enterprise = config.pipelines.find((pipeline) => !pipeline.isDefault)
  const discovery = config.stages.find((stage) => stage.pipelineId === enterprise?.id && stage.type === 'open')
  if (enterprise && discovery) {
    withIds
      .filter((deal) => config.stages.find((stage) => stage.id === deal.stageId)?.type === 'open')
      .slice(0, 5)
      .forEach((deal) => {
        deal.pipelineId = enterprise.id
        deal.stageId = discovery.id
      })
  }
  const positionByStage = new Map<string, number>()
  for (const deal of withIds) {
    const position = (positionByStage.get(deal.stageId) ?? 0) + 1
    positionByStage.set(deal.stageId, position)
    deal.position = position
  }

  for (const customer of customers.values()) {
    if (customer.lifetimeValue === 0)
      customer.lifetimeValue = roundTo(int(env, 30, 300) * 1000, 5000)
  }

  return { deals: withIds, customers: [...customers.values()], companies: [...companies.values()] }
}
