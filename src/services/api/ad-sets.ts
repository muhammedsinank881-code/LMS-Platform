import type { Ad, AdInput, AdSet, AdSetInput } from '@/types'

export interface AdSetsApiClient {
  listAdSets(campaignId: string): Promise<AdSet[]>
  createAdSet(input: AdSetInput): Promise<AdSet>
  updateAdSet(id: string, patch: Partial<Omit<AdSetInput, 'campaignId'>>): Promise<AdSet>
  /** Deletes the ad set and its ads. Leads and spend keep their campaign but lose the ad link. */
  deleteAdSet(id: string): Promise<void>
  listAds(campaignId: string): Promise<Ad[]>
  createAd(input: AdInput): Promise<Ad>
  updateAd(id: string, patch: Partial<Omit<AdInput, 'adSetId'>>): Promise<Ad>
  deleteAd(id: string): Promise<void>
}
