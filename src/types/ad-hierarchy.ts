import type { TenantOwned } from './common'
import type { CampaignStatus } from './campaign'

export interface AdSet extends TenantOwned {
  id: string
  campaignId: string
  name: string
  platformId: string
  status: CampaignStatus
  createdAt: string
}

export interface Ad extends TenantOwned {
  id: string
  adSetId: string
  campaignId: string
  name: string
  platformId: string
  status: CampaignStatus
  createdAt: string
}

export type AdSetInput = Pick<AdSet, 'campaignId' | 'name' | 'platformId' | 'status'>
export type AdInput = Pick<Ad, 'adSetId' | 'name' | 'platformId' | 'status'>
