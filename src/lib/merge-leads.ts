import { MERGEABLE_FIELDS, type Lead, type LeadMergeChoices, type MergeableField } from '@/types'

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

function assign<K extends MergeableField>(target: Partial<Lead>, key: K, value: Lead[K]): void {
  target[key] = value
}

function earliest(a: string | null, b: string | null): string | null {
  if (a === null) return b
  if (b === null) return a
  return a <= b ? a : b
}

function latest(a: string | null, b: string | null): string | null {
  if (a === null) return b
  if (b === null) return a
  return a >= b ? a : b
}

function smallest(a: number | null, b: number | null): number | null {
  if (a === null) return b
  if (b === null) return a
  return Math.min(a, b)
}

/**
 * Combines two leads into one record that keeps the primary's id.
 *
 * - Each field in `fieldChoices` comes from the chosen side.
 * - Fields without a choice default to the primary, but fall back to the secondary when the
 *   primary is empty, so merging never loses information.
 * - Tags are unioned; custom fields and qualification answers are merged (primary wins ties).
 * - History fields keep the earliest creation time, latest contact and earliest next follow-up.
 *
 * Pure: neither input is modified. The caller is responsible for re-scoring and for archiving
 * the secondary record.
 */
export function mergeLeads(
  primary: Lead,
  secondary: Lead,
  fieldChoices: LeadMergeChoices = {},
): Lead {
  const chosen: Partial<Lead> = {}
  for (const field of MERGEABLE_FIELDS) {
    const choice = fieldChoices[field]
    const useSecondary =
      choice === 'secondary' ||
      (choice === undefined && isBlank(primary[field]) && !isBlank(secondary[field]))
    assign(chosen, field, useSecondary ? secondary[field] : primary[field])
  }

  return {
    ...primary,
    ...chosen,
    tags: [...new Set([...primary.tags, ...secondary.tags])],
    qualificationAnswers: { ...secondary.qualificationAnswers, ...primary.qualificationAnswers },
    customFields: { ...secondary.customFields, ...primary.customFields },
    createdAt: earliest(primary.createdAt, secondary.createdAt) ?? primary.createdAt,
    lastContactedAt: latest(primary.lastContactedAt, secondary.lastContactedAt),
    nextFollowUpAt: earliest(primary.nextFollowUpAt, secondary.nextFollowUpAt),
    firstResponseTimeMins: smallest(primary.firstResponseTimeMins, secondary.firstResponseTimeMins),
    convertedToCustomerId: primary.convertedToCustomerId ?? secondary.convertedToCustomerId ?? null,
    duplicateOf: null,
    archivedAt: null,
  }
}
