import type {
  DuplicateConfidence,
  DuplicateGroup,
  DuplicateMatch,
  DuplicateMatchField,
  DuplicateProbe,
  Lead,
  LeadSummary,
} from '@/types'
import { normalizePhone } from './phone'

/** What a stored lead must expose for matching. `Lead` satisfies it. */
export type DuplicateCandidate = LeadSummary &
  DuplicateProbe & { whatsapp?: string | null; archivedAt?: string | null }

const COMPANY_SUFFIXES = new Set([
  'pvt',
  'private',
  'ltd',
  'limited',
  'llp',
  'inc',
  'co',
  'corp',
  'company',
  'opc',
])

export function normalizeEmail(email: string | null | undefined): string | null {
  const value = email?.trim().toLowerCase()
  return value && value.includes('@') ? value : null
}

/** "Sharma Traders Pvt. Ltd." and "sharma traders" compare equal. */
export function normalizeCompany(name: string | null | undefined): string | null {
  if (!name) return null
  const words = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !COMPANY_SUFFIXES.has(word))
  const normalized = words.join(' ')
  return normalized.length >= 2 ? normalized : null
}

const CONFIDENCE_RANK: Record<DuplicateConfidence, number> = { high: 3, medium: 2, low: 1 }

export interface PairMatch {
  matchedOn: DuplicateMatchField[]
  confidence: DuplicateConfidence
}

/**
 * Compares two contacts. Phone or email match = high confidence; a WhatsApp-only match =
 * medium; a shared company alone = low. Returns null when nothing matches.
 */
export function compareContacts(a: DuplicateProbe, b: DuplicateProbe): PairMatch | null {
  const bNumbers = new Set(
    [normalizePhone(b.phone), normalizePhone(b.whatsapp)].filter((n): n is string => n !== null),
  )
  const aPhone = normalizePhone(a.phone)
  const aWhatsapp = normalizePhone(a.whatsapp)
  const aEmail = normalizeEmail(a.email)
  const aCompany = normalizeCompany(a.company)

  const matchedOn: DuplicateMatchField[] = []
  if (aPhone && bNumbers.has(aPhone)) matchedOn.push('phone')
  if (aEmail && aEmail === normalizeEmail(b.email)) matchedOn.push('email')
  if (aWhatsapp && bNumbers.has(aWhatsapp)) matchedOn.push('whatsapp')
  if (aCompany && aCompany === normalizeCompany(b.company)) matchedOn.push('company')
  if (matchedOn.length === 0) return null

  const confidence: DuplicateConfidence =
    matchedOn.includes('phone') || matchedOn.includes('email')
      ? 'high'
      : matchedOn.includes('whatsapp')
        ? 'medium'
        : 'low'
  return { matchedOn, confidence }
}

function toSummary(lead: DuplicateCandidate): LeadSummary {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    company: lead.company,
    statusId: lead.statusId,
    assignedTo: lead.assignedTo,
    createdAt: lead.createdAt,
  }
}

/**
 * Existing leads that look like the same person as `lead`, best match first (then oldest).
 * The lead itself and archived (merged) leads are never returned.
 */
export function findDuplicates(
  lead: DuplicateProbe & { id?: string },
  existing: readonly DuplicateCandidate[],
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = []
  for (const candidate of existing) {
    if (candidate.id === lead.id || candidate.archivedAt) continue
    const pair = compareContacts(lead, candidate)
    if (pair) matches.push({ lead: toSummary(candidate), ...pair })
  }
  return matches.sort(
    (a, b) =>
      CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence] ||
      b.matchedOn.length - a.matchedOn.length ||
      a.lead.createdAt.localeCompare(b.lead.createdAt),
  )
}

/**
 * Clusters leads that are linked by phone, email or WhatsApp (company alone is too weak to
 * group on) for the duplicates review queue. Groups are returned largest first.
 */
export function groupDuplicates(leads: readonly Lead[]): DuplicateGroup[] {
  const active = leads.filter((lead) => !lead.archivedAt)
  const parent = active.map((_, index) => index)
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])))

  const edges: Array<{ a: number; b: number; pair: PairMatch }> = []
  for (let a = 0; a < active.length; a += 1) {
    for (let b = a + 1; b < active.length; b += 1) {
      const pair = compareContacts(active[a], active[b])
      if (pair && pair.confidence !== 'low') {
        edges.push({ a, b, pair })
        parent[find(a)] = find(b)
      }
    }
  }

  const groups = new Map<number, DuplicateGroup>()
  for (const { a, pair } of edges) {
    const root = find(a)
    const existing = groups.get(root)
    if (existing) {
      for (const field of pair.matchedOn) {
        if (!existing.matchedOn.includes(field)) existing.matchedOn.push(field)
      }
      if (CONFIDENCE_RANK[pair.confidence] > CONFIDENCE_RANK[existing.confidence]) {
        existing.confidence = pair.confidence
      }
    } else {
      groups.set(root, {
        key: '',
        matchedOn: [...pair.matchedOn],
        confidence: pair.confidence,
        leads: [],
      })
    }
  }

  active.forEach((lead, index) => {
    groups.get(find(index))?.leads.push(toSummary(lead))
  })

  return [...groups.values()]
    .map((group) => {
      const leadsByAge = [...group.leads].sort((x, y) => x.createdAt.localeCompare(y.createdAt))
      return { ...group, leads: leadsByAge, key: leadsByAge.map((l) => l.id).join('+') }
    })
    .sort((x, y) => y.leads.length - x.leads.length || x.key.localeCompare(y.key))
}
