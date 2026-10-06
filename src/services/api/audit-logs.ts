import type { AuditLog, AuditLogListParams, Paginated } from '@/types'

/** Read-only: audit entries are written by the backend as a side effect of other actions. */
export interface AuditExport {
  filename: string
  csv: string
}

export interface AuditLogsApiClient {
  list(params?: AuditLogListParams): Promise<Paginated<AuditLog>>
  get(id: string): Promise<AuditLog>
  /** Every row matching the filters, not just the current page. Writes an audit entry. */
  export(params?: AuditLogListParams): Promise<AuditExport>
}
