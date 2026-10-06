import type { DirectoryUser } from '@/services/api/team'
import type { Campaign, LeadSource, LeadStatus, Tag } from '@/types'

export interface LeadLookups {
  statuses: LeadStatus[]
  sources: LeadSource[]
  campaigns: Campaign[]
  tags: Tag[]
  users: DirectoryUser[]
}

export function statusById(lookups: LeadLookups, id: string): LeadStatus | undefined {
  return lookups.statuses.find((item) => item.id === id)
}

export function sourceById(lookups: LeadLookups, id: string): LeadSource | undefined {
  return lookups.sources.find((item) => item.id === id)
}

export function campaignById(lookups: LeadLookups, id: string | null): Campaign | undefined {
  return id ? lookups.campaigns.find((item) => item.id === id) : undefined
}

export function userById(lookups: LeadLookups, id: string | null): DirectoryUser | undefined {
  return id ? lookups.users.find((item) => item.id === id) : undefined
}
