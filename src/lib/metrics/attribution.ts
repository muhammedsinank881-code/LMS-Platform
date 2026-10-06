import type { Attribution } from '@/types'

export interface AttributableLead {
  sourceId: string
  originalSourceId?: string | null
  campaignId: string | null
}

/**
 * The channel a lead is credited to. First touch is the source it originally came in through;
 * last touch is the platform of its latest campaign, falling back to its current source.
 */
export function attributionKey(
  lead: AttributableLead,
  mode: Attribution,
  platformOf: (campaignId: string) => string | null,
): string {
  if (mode === 'first') return lead.originalSourceId ?? lead.sourceId
  const platform = lead.campaignId ? platformOf(lead.campaignId) : null
  return platform ?? lead.sourceId
}
