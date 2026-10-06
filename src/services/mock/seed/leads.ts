import { calculateLeadScore } from '@/lib/scoring'
import { toLeadId, type Ad, type Campaign, type Lead, type Priority, type User } from '@/types'
import type { TenantConfig } from './config'
import { CITIES, PRODUCTS, REQUIREMENTS, fillTemplate } from './indian-data'
import {
  CREATED_AGE_DAYS,
  SOURCE_WEIGHTS,
  STATUS_WEIGHTS,
  makeAnswers,
  makeBudget,
  makeCompany,
  makeCustomFields,
  makeEmail,
  makeLeadType,
  makeName,
  makePhone,
} from './lead-parts'
import { SEED_TAGS } from './config-data'
import {
  DAY,
  HOUR,
  MINUTE,
  allocate,
  chance,
  int,
  pick,
  sample,
  scaled,
  seedId,
  shuffle,
  weighted,
  type SeedEnv,
} from './rng'

export interface LeadSeedContext {
  config: TenantConfig
  users: User[]
  campaigns: Campaign[]
  ads: Ad[]
}

type Draft = Omit<Lead, 'id' | 'duplicateOf'> & { ref: number; duplicateRef: number | null }

const PLATFORM_BY_SOURCE: Record<string, Campaign['platform']> = {
  facebook: 'facebook',
  instagram: 'instagram',
  google_ads: 'google_ads',
  linkedin: 'linkedin',
  whatsapp: 'whatsapp',
  email: 'email',
}

const QUALIFIED_SLUGS = new Set(['qualified', 'demo', 'proposal', 'negotiation', 'won'])

/**
 * Builds the workspace's leads: every status and source is represented, scores come from the
 * real scoring function, and a few pairs share a phone number under different names so the
 * duplicate flows have something to find.
 */
export function buildLeads(env: SeedEnv, ctx: LeadSeedContext, counterBase: number): Lead[] {
  const { config, users, campaigns, ads } = ctx
  const total = scaled(env, 200, 40)
  const phonePairs = scaled(env, 8, 2)
  const companyPairs = scaled(env, 3, 1)
  const baseCount = total - phonePairs - companyPairs
  const unassignedNew = scaled(env, 10, 2)

  const assignable = users.filter((u) => u.role === 'salesperson' || u.role === 'team_leader')
  const assigneeChoices = assignable.map((u) => ({
    value: u,
    weight: u.role === 'salesperson' ? 3 : 2,
  }))
  const usedPhones = new Set<string>()
  const statusId = (slug: string) => seedId(env, 'status', slug)
  const sourceId = (key: string) => seedId(env, 'source', key)

  const statusPlan = shuffle(
    env,
    allocate(
      baseCount,
      STATUS_WEIGHTS.map(([, w]) => w),
    ).flatMap((count, i) => Array<string>(count).fill(STATUS_WEIGHTS[i][0])),
  )
  const sourcePlan = shuffle(
    env,
    allocate(
      baseCount,
      SOURCE_WEIGHTS.map(([, w]) => w),
    ).flatMap((count, i) => Array<string>(count).fill(SOURCE_WEIGHTS[i][0])),
  )

  function campaignFor(sourceKey: string): string | null {
    const platform = PLATFORM_BY_SOURCE[sourceKey] ?? (chance(env, 0.2) ? 'google_ads' : null)
    const matching = campaigns.filter((c) => c.platform === platform)
    return matching.length > 0 && chance(env, 0.85) ? pick(env, matching).id : null
  }

  function buildDraft(ref: number, slug: string, sourceKey: string, createdAt: Date): Draft {
    const person = makeName(env)
    const company = chance(env, 0.5) ? makeCompany(env) : null
    const phone = chance(env, 0.96) ? makePhone(env, usedPhones) : null
    const email = !phone || chance(env, 0.8) ? makeEmail(env, person, company) : null
    const whatsapp =
      phone && chance(env, 0.65) ? phone : chance(env, 0.1) ? makePhone(env, usedPhones) : null
    const campaignId = campaignFor(sourceKey)
    const campaignAds = ads.filter((item) => item.campaignId === campaignId)
    const ad = campaignAds.length > 0 ? pick(env, campaignAds) : null
    const city = pick(env, CITIES)
    const product = pick(env, PRODUCTS)
    const requirement = fillTemplate(pick(env, REQUIREMENTS), { product })
    const owner = weighted(env, assigneeChoices)
    const now = env.now.getTime()
    const created = createdAt.getTime()
    const contacted = slug !== 'new'
    const firstContact = contacted
      ? Math.min(now, created + int(env, 10 * MINUTE, 36 * HOUR))
      : null
    const lastContact =
      firstContact === null
        ? null
        : Math.min(
            now,
            Math.max(
              firstContact,
              created + Math.round((now - created) * (int(env, 20, 95) / 100)),
            ),
          )
    const assignedAt = Math.min(now, created + int(env, MINUTE, 30 * MINUTE))

    const draft: Omit<Draft, 'score' | 'scoreCategory' | 'scoreBreakdown' | 'priority'> = {
      ref,
      duplicateRef: null,
      tenantId: env.tenantId,
      name: person.name,
      phone,
      whatsapp,
      email,
      company,
      location: city.city,
      sourceId: sourceId(sourceKey),
      campaignId,
      adSetId: ad?.adSetId ?? null,
      adId: ad?.id ?? null,
      originalSourceId: chance(env, 0.25)
        ? sourceId(pick(env, ['facebook', 'google_ads', 'website', 'instagram']))
        : sourceId(sourceKey),
      whatsappOptOut: chance(env, 0.1),
      productInterest: product,
      budget: makeBudget(env),
      requirement,
      leadType: makeLeadType(company),
      language: pick(env, city.languages),
      tags: chance(env, 0.35) ? sample(env, SEED_TAGS, int(env, 1, 2)) : [],
      statusId: statusId(slug),
      assignedTo: owner.id,
      assignedAt: new Date(assignedAt).toISOString(),
      qualificationStatus: qualificationFor(slug),
      qualificationAnswers: QUALIFIED_SLUGS.has(slug) ? makeAnswers(env, requirement) : {},
      customFields: makeCustomFields(env, company !== null),
      lostReasonId:
        slug === 'lost' ? seedId(env, 'lost', int(env, 1, config.lostReasons.length)) : null,
      convertedToCustomerId: null,
      createdBy: chance(env, 0.3) ? owner.id : null,
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(lastContact ?? created).toISOString(),
      lastContactedAt: lastContact === null ? null : new Date(lastContact).toISOString(),
      nextFollowUpAt: null,
      firstResponseTimeMins:
        firstContact === null ? null : Math.max(2, Math.round((firstContact - created) / MINUTE)),
      archivedAt: null,
      pipelineId: '',
      stageId: '',
      position: 0,
      stageEnteredAt: createdAt.toISOString(),
    }
    return scoreDraft(draft)
  }

  function qualificationFor(slug: string): Lead['qualificationStatus'] {
    if (QUALIFIED_SLUGS.has(slug)) return 'qualified'
    if (slug === 'junk') return 'not_qualified'
    if (slug === 'lost') return chance(env, 0.7) ? 'not_qualified' : 'qualified'
    if (slug === 'interested') return chance(env, 0.3) ? 'qualified' : 'needs_info'
    return 'needs_info'
  }

  function scoreDraft(
    draft: Omit<Draft, 'score' | 'scoreCategory' | 'scoreBreakdown' | 'priority'>,
  ): Draft {
    const result = calculateLeadScore(
      draft,
      config.scoringRules,
      config.settings.scoringThresholds,
      env.now,
    )
    const priority: Priority =
      result.category === 'hot'
        ? weighted(env, [
            { value: 'urgent', weight: 2 },
            { value: 'high', weight: 8 },
          ])
        : result.category === 'warm'
          ? weighted(env, [
              { value: 'high', weight: 3 },
              { value: 'medium', weight: 7 },
            ])
          : weighted(env, [
              { value: 'medium', weight: 3 },
              { value: 'low', weight: 7 },
            ])
    return {
      ...draft,
      score: result.score,
      scoreCategory: result.category,
      scoreBreakdown: result.breakdown,
      priority,
    }
  }

  const drafts: Draft[] = statusPlan.map((slug, i) => {
    const [minAge, maxAge] = CREATED_AGE_DAYS[slug]
    const age = int(env, minAge * DAY + HOUR, Math.max(minAge * DAY + 2 * HOUR, maxAge * DAY))
    return buildDraft(i, slug, sourcePlan[i], new Date(env.now.getTime() - age))
  })

  // The newest untouched leads have not been routed to anyone yet.
  drafts
    .filter((d) => d.statusId === statusId('new'))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, unassignedNew)
    .forEach((d) => {
      d.assignedTo = null
      d.assignedAt = null
      d.createdBy = null
    })

  // Same phone, different name: the second record is the newer one and points at the original.
  const olderWithPhone = drafts.filter(
    (d) => d.phone && env.now.getTime() - Date.parse(d.createdAt) > 6 * DAY,
  )
  sample(env, olderWithPhone, phonePairs).forEach((original, i) => {
    const ref = baseCount + i
    const slug = i % 2 === 0 ? 'new' : 'contacted'
    const copyAge = Math.max(HOUR, Date.parse(original.createdAt) + int(env, 2 * DAY, 5 * DAY))
    const createdAt = new Date(Math.min(copyAge, env.now.getTime() - HOUR))
    const copy = buildDraft(
      ref,
      slug,
      pick(env, ['website', 'whatsapp', 'landing_page']),
      createdAt,
    )
    const sameEmail = i < 2 && original.email
    const other = assignable.find((u) => u.id !== original.assignedTo) ?? assignable[0]
    drafts.push(
      scoreDraft({
        ...copy,
        phone: original.phone,
        whatsapp: original.whatsapp,
        email: sameEmail ? original.email : copy.email,
        company: i % 2 === 0 ? original.company : copy.company,
        assignedTo: other.id,
        duplicateRef: original.ref,
      }),
    )
  })

  // Same company, different person and number: worth a look, but not a duplicate flag.
  sample(
    env,
    drafts.filter((d) => d.company && d.ref < baseCount),
    companyPairs,
  ).forEach((original, i) => {
    const createdAt = new Date(
      Math.min(Date.parse(original.createdAt) + 3 * DAY, env.now.getTime() - HOUR),
    )
    const copy = buildDraft(baseCount + phonePairs + i, 'new', 'website', createdAt)
    drafts.push(
      scoreDraft({ ...copy, company: original.company?.replace(/ (Pvt Ltd|LLP)$/, '') ?? null }),
    )
  })

  const sorted = drafts.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.ref - b.ref)
  const idByRef = new Map(sorted.map((draft, i) => [draft.ref, toLeadId(counterBase + i + 1)]))
  const pipelineId = config.pipelines.find((pipeline) => pipeline.isDefault)?.id ?? config.pipelines[0].id
  const stageForStatus: Record<string, string> = {
    new: 'new',
    contacted: 'new',
    'not-reachable': 'new',
    interested: 'qualified',
    qualified: 'qualified',
    demo: 'qualified',
    proposal: 'proposal',
    negotiation: 'negotiation',
    'on-hold': 'proposal',
    won: 'won',
    lost: 'lost',
    junk: 'lost',
  }
  const positionByStage = new Map<string, number>()
  return sorted.map(({ ref, duplicateRef, statusId: status, ...lead }) => {
    const slug = Object.keys(stageForStatus).find((key) => seedId(env, 'status', key) === status) ?? 'new'
    const stageId = seedId(env, 'stage', stageForStatus[slug] ?? 'new')
    const position = (positionByStage.get(stageId) ?? 0) + 1
    positionByStage.set(stageId, position)
    return {
      ...lead,
      statusId: status,
      id: idByRef.get(ref) ?? toLeadId(counterBase + 1),
      duplicateOf: duplicateRef === null ? null : (idByRef.get(duplicateRef) ?? null),
      pipelineId,
      stageId,
      position,
      stageEnteredAt: lead.updatedAt,
    }
  })
}
