import { UTM_KEYS, type Utm } from '@/types'

type UtmInput = string | URLSearchParams | Record<string, string | undefined>

/** Reads utm_source, utm_medium, utm_campaign, utm_content and utm_term. Empty values are dropped. */
export function captureUtm(input: UtmInput): Utm {
  const params =
    typeof input === 'string'
      ? new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
      : input instanceof URLSearchParams
        ? input
        : new URLSearchParams(Object.entries(input).flatMap(([k, v]) => (v === undefined ? [] : [[k, v]])))
  const utm: Utm = {}
  for (const key of UTM_KEYS) {
    const value = params.get(`utm_${key}`)?.trim().slice(0, 120)
    if (value) utm[key] = value
  }
  return utm
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * The campaign a `utm_campaign` value points at: its id, or a name that matches ignoring case,
 * spaces and punctuation ("diwali-dhamaka-search" finds "Diwali Dhamaka: Search"). Archived
 * campaigns never match.
 */
export function matchCampaign(
  utm: Utm,
  campaigns: ReadonlyArray<{ id: string; name: string; archivedAt: string | null }>,
): string | null {
  const wanted = utm.campaign
  if (!wanted) return null
  const target = slug(wanted)
  const live = campaigns.filter((campaign) => !campaign.archivedAt)
  return (
    live.find((campaign) => campaign.id === wanted)?.id ??
    live.find((campaign) => slug(campaign.name) === target)?.id ??
    null
  )
}
