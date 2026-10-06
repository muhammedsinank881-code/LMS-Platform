import type { AnswerValue, CustomFieldValue, LeadType } from '@/types'
import {
  COMPANY_STEMS,
  COMPANY_SUFFIXES,
  FIRST_NAMES,
  GST_PREFIXES,
  LAST_NAMES,
} from './indian-data'
import { chance, int, pick, sample, seedId, weighted, type SeedEnv } from './rng'

export interface PersonParts {
  first: string
  last: string
  name: string
}

export function makeName(env: SeedEnv, avoid?: string): PersonParts {
  for (;;) {
    const first = pick(env, FIRST_NAMES)
    const last = pick(env, LAST_NAMES)
    if (last !== avoid) return { first, last, name: `${first} ${last}` }
  }
}

/** Indian mobile in canonical +91 form, unique within the set. */
export function makePhone(env: SeedEnv, used: Set<string>): string {
  for (;;) {
    const phone = `+91${int(env, 6, 9)}${String(int(env, 0, 999_999_999)).padStart(9, '0')}`
    if (!used.has(phone)) {
      used.add(phone)
      return phone
    }
  }
}

const FREE_MAIL = ['gmail.com', 'gmail.com', 'yahoo.in', 'outlook.com', 'rediffmail.com'] as const

export function makeEmail(env: SeedEnv, person: PersonParts, company: string | null): string {
  const local = `${person.first}.${person.last}${int(env, 1, 99)}`.toLowerCase()
  if (company) {
    const domain = company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 18)
    return `${person.first.toLowerCase()}@${domain}.in`
  }
  return `${local}@${pick(env, FREE_MAIL)}`
}

export function makeCompany(env: SeedEnv): string {
  const suffix = pick(env, COMPANY_SUFFIXES)
  return `${pick(env, COMPANY_STEMS)}${suffix ? ` ${suffix}` : ''}`
}

const BUDGET_TIERS: Array<{ value: number; weight: number }> = [
  { value: 15_000, weight: 10 },
  { value: 25_000, weight: 12 },
  { value: 40_000, weight: 12 },
  { value: 60_000, weight: 12 },
  { value: 90_000, weight: 10 },
  { value: 120_000, weight: 10 },
  { value: 180_000, weight: 8 },
  { value: 250_000, weight: 8 },
  { value: 400_000, weight: 6 },
  { value: 600_000, weight: 5 },
  { value: 1_000_000, weight: 4 },
  { value: 2_500_000, weight: 2 },
]

export function makeBudget(env: SeedEnv): number | null {
  return chance(env, 0.05) ? null : weighted(env, BUDGET_TIERS)
}

export function makeLeadType(company: string | null): LeadType {
  return company ? 'b2b' : 'b2c'
}

const SERVICES = ['SEO', 'Social media', 'Ads', 'Website', 'Branding']

export function makeCustomFields(env: SeedEnv, b2b: boolean): Record<string, CustomFieldValue> {
  const fields: Record<string, CustomFieldValue> = {}
  if (chance(env, 0.5)) {
    fields.preferred_contact_time = pick(env, ['Morning', 'Afternoon', 'Evening'])
  }
  if (b2b && chance(env, 0.55)) {
    const letters = Array.from({ length: 5 }, () => String.fromCharCode(65 + int(env, 0, 25))).join(
      '',
    )
    fields.gst_number = `${pick(env, GST_PREFIXES)}${letters}${int(env, 1000, 9999)}A1Z${int(env, 1, 9)}`
    fields.company_size = int(env, 4, 250)
  }
  if (chance(env, 0.4)) fields.interested_services = sample(env, SERVICES, int(env, 1, 2))
  if (chance(env, 0.35)) fields.brochure_sent = chance(env, 0.6)
  return fields
}

export function makeAnswers(env: SeedEnv, requirement: string): Record<string, AnswerValue> {
  const q = (n: number) => seedId(env, 'qq', n)
  return {
    [q(1)]: chance(env, 0.8),
    [q(2)]: pick(env, ['Yes', 'Yes', 'Influencer', 'No']),
    [q(3)]: pick(env, ['Immediately', 'Within a month', '1-3 months', '3+ months']),
    [q(4)]: requirement,
    [q(5)]: pick(env, ['Local agency', 'In-house team', 'Nothing yet', 'Freelancer']),
    [q(6)]: int(env, 3, 120),
  }
}

/** Pipeline progress by status slug: how far along the sales journey a lead is. */
export const STATUS_PROGRESS: Record<string, number> = {
  new: 0,
  contacted: 1,
  'not-reachable': 1,
  interested: 2,
  qualified: 3,
  demo: 4,
  proposal: 5,
  negotiation: 6,
  'on-hold': 3,
  won: 7,
  lost: 5,
  junk: 1,
}

export const STATUS_WEIGHTS: Array<[slug: string, weight: number]> = [
  ['new', 30],
  ['contacted', 28],
  ['not-reachable', 14],
  ['interested', 24],
  ['qualified', 22],
  ['demo', 12],
  ['proposal', 14],
  ['negotiation', 10],
  ['on-hold', 6],
  ['won', 14],
  ['lost', 20],
  ['junk', 6],
]

export const SOURCE_WEIGHTS: Array<[key: string, weight: number]> = [
  ['website', 22],
  ['whatsapp', 14],
  ['facebook', 18],
  ['instagram', 10],
  ['google_ads', 14],
  ['linkedin', 6],
  ['manual', 4],
  ['phone', 5],
  ['email', 3],
  ['landing_page', 8],
  ['import', 4],
  ['api', 2],
]

/** [minDays, maxDays] ago a lead in this status was created. */
export const CREATED_AGE_DAYS: Record<string, [number, number]> = {
  new: [0, 14],
  contacted: [1, 45],
  'not-reachable': [2, 45],
  interested: [3, 50],
  qualified: [10, 70],
  demo: [10, 70],
  proposal: [14, 75],
  negotiation: [14, 75],
  'on-hold': [15, 80],
  won: [30, 90],
  lost: [20, 90],
  junk: [1, 60],
}
