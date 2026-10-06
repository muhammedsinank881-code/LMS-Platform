import type { Ad, Campaign, Company, Customer, Deal, FollowUp, Lead, Task, User } from '@/types'
import type { TenantConfig } from './config'

/** First number issued for each human-readable id counter, per workspace. */
export interface CounterBases {
  lead: number
  deal: number
  customer: number
  task: number
}

export const counterBasesFor = (leadBase: number): CounterBases => ({
  lead: leadBase,
  deal: leadBase / 10,
  customer: leadBase / 10,
  task: leadBase / 10,
})

/** What the later seed builders can see of the workspace built so far. */
export interface SeedContext {
  config: TenantConfig
  users: User[]
  campaigns: Campaign[]
  ads: Ad[]
  leads: Lead[]
  bases: CounterBases
}

export interface SeedSales {
  deals: Deal[]
  customers: Customer[]
  companies: Company[]
}

export interface SeedWork {
  followUps: FollowUp[]
  tasks: Task[]
}

/** Users who own leads: salespeople and team leaders. */
export const assignableUsers = (users: readonly User[]): User[] =>
  users.filter((u) => u.role === 'salesperson' || u.role === 'team_leader')
