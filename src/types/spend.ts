import type { ListParams, TenantOwned } from './common'

export const SPEND_SOURCES = ['manual', 'synced'] as const
export type SpendSource = (typeof SPEND_SOURCES)[number]

export interface SpendEntry extends TenantOwned {
  id: string
  campaignId: string
  adSetId?: string | null
  adId?: string | null
  /** yyyy-MM-dd. */
  date: string
  amount: number
  currency: string
  source: SpendSource
  notes: string
}

export type SpendInput = Omit<SpendEntry, 'id' | 'tenantId' | 'source'> & { source?: SpendSource }

export type SpendFilterField = 'campaignId' | 'adSetId' | 'adId' | 'date' | 'source'
export interface SpendListParams extends ListParams<SpendFilterField> {
  campaignId: string
}

/** One parsed CSV row: date, amount and optional ad set / ad names. */
export interface SpendImportRow {
  date: string
  amount: string
  adSet?: string
  ad?: string
  notes?: string
}

export interface SpendImportResult {
  imported: number
  skipped: number
  errors: Array<{ row: number; message: string }>
}
