import type {
  AuditLog,
  BreakdownMetricsRow,
  Campaign,
  CampaignDetailMetrics,
  CampaignListParams,
  CampaignMetrics,
  CampaignMetricsQuery,
  CampaignTimePoint,
  CampaignWithMetrics,
  FunnelStep,
} from '@/types'
import type { CrudClient } from './resource'

export type CampaignInput = Omit<Campaign, 'id' | 'tenantId' | 'createdAt' | 'archivedAt'>

export const CAMPAIGN_BULK_ACTIONS = ['pause', 'resume', 'archive'] as const
export type CampaignBulkAction = (typeof CAMPAIGN_BULK_ACTIONS)[number]

/**
 * Metrics are aggregated server-side for the caller's data scope. Spend and revenue figures come
 * back null for roles without the view-spend permission.
 */
export interface CampaignsApiClient extends CrudClient<
  CampaignWithMetrics,
  CampaignInput,
  Partial<CampaignInput>,
  CampaignListParams
> {
  /** Blended totals for every campaign matching the filters, not just the current page. */
  getSummary(params?: CampaignListParams): Promise<CampaignMetrics>
  /** Metrics for the range, the previous period when `compare` is set, and the tenant average CPL. */
  getDetail(id: string, query: CampaignMetricsQuery): Promise<CampaignDetailMetrics>
  /** Spend, Leads, Qualified, Deals, Revenue with step conversion percentages. */
  getFunnel(id: string, query: CampaignMetricsQuery): Promise<FunnelStep[]>
  getTimeSeries(id: string, query: CampaignMetricsQuery): Promise<CampaignTimePoint[]>
  /** Ad sets with their ads nested. The ad set figures are the sum of its ads. */
  getBreakdown(id: string, query: CampaignMetricsQuery): Promise<BreakdownMetricsRow[]>
  /** The audit trail for one campaign and its spend, newest first. Needs campaigns view, not audit access. */
  listActivity(id: string): Promise<AuditLog[]>
  bulkAction(ids: string[], action: CampaignBulkAction): Promise<void>
}
