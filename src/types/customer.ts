import type { ListParams, TenantOwned } from './common'
import type { CompanyId, CustomerId, LeadId, UserId } from './ids'
import type { CustomFieldValue } from './lead'

export interface Company extends TenantOwned {
  id: CompanyId
  name: string
  industry: string | null
  website: string | null
  city: string | null
  size: string | null
  createdAt: string
}

export interface Customer extends TenantOwned {
  id: CustomerId
  name: string
  phone: string | null
  email: string | null
  companyId: CompanyId | null
  /** The lead this customer came from. The lead and its history are kept. */
  originLeadId: LeadId | null
  ownerId: UserId
  lifetimeValue: number
  tags: string[]
  customFields: Record<string, CustomFieldValue>
  createdAt: string
  updatedAt: string
}

export type CustomerFilterField =
  'name' | 'email' | 'phone' | 'ownerId' | 'companyId' | 'lifetimeValue' | 'createdAt' | 'tags'
export type CustomerListParams = ListParams<CustomerFilterField>
export type CompanyListParams = ListParams<'name' | 'industry' | 'city' | 'createdAt'>
