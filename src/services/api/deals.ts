import type {
  Activity,
  ActivityListParams,
  BulkDealStageInput,
  CreateDealInput,
  Deal,
  DealId,
  DealListParams,
  DealsSummary,
  LeadId,
  ManualActivityInput,
  MoveDealStageInput,
  Paginated,
  ReopenDealInput,
  UpdateDealInput,
} from '@/types'
import type { CrudClient } from './resource'

export interface DealsApiClient extends CrudClient<
  Deal,
  CreateDealInput,
  UpdateDealInput,
  DealListParams,
  DealId
> {
  /** Moving into a lost stage requires `lostReasonId`. Won records the close and may create a customer. */
  moveStage(id: DealId, input: MoveDealStageInput): Promise<Deal>
  /** Moves a won or lost deal back to an open stage. */
  reopen(id: DealId, input: ReopenDealInput): Promise<Deal>
  bulkMoveStage(input: BulkDealStageInput): Promise<Deal[]>
  bulkAssign(ids: DealId[], ownerId: string): Promise<Deal[]>
  bulkDelete(ids: DealId[]): Promise<void>
  /** Every deal matching `params`, ignoring pagination. Requires the export permission. */
  exportRows(params?: DealListParams): Promise<Deal[]>
  listActivities(id: DealId, params?: ActivityListParams): Promise<Paginated<Activity>>
  addActivity(id: DealId, input: ManualActivityInput): Promise<Activity>
  /** "Convert Lead to Opportunity". */
  createFromLead(leadId: LeadId, input: Omit<CreateDealInput, 'leadId'>): Promise<Deal>
  /** Open-pipeline totals and a row per stage, for deals matching `params`. */
  getSummary(params?: DealListParams): Promise<DealsSummary>
}
