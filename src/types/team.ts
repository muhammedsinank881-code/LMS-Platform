import type { TenantOwned } from './common'

export interface Team extends TenantOwned {
  id: string
  name: string
  /** Team leader's user id. */
  leaderId: string | null
  color: string
  createdAt: string
}
