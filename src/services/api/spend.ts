import type {
  Paginated,
  SpendEntry,
  SpendImportResult,
  SpendImportRow,
  SpendInput,
  SpendListParams,
} from '@/types'

/** Every call needs the view-spend permission. */
export interface SpendApiClient {
  list(params: SpendListParams): Promise<Paginated<SpendEntry>>
  create(input: SpendInput): Promise<SpendEntry>
  update(id: string, patch: Partial<SpendInput>): Promise<SpendEntry>
  delete(id: string): Promise<void>
  /** Imports parsed CSV rows. Bad rows are reported and skipped, good ones are kept. */
  importCsv(campaignId: string, rows: SpendImportRow[]): Promise<SpendImportResult>
}
