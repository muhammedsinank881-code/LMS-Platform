import type {
  Activity,
  ActivityListParams,
  AnswerValue,
  Company,
  CreateLeadInput,
  Customer,
  CreateDealInput,
  Deal,
  DealsSummary,
  DuplicateGroup,
  DuplicateMatch,
  DuplicateProbe,
  ImportLeadsResult,
  Lead,
  LeadId,
  LeadListParams,
  LeadMergeChoices,
  LeadSummary,
  ManualActivityInput,
  Paginated,
  QualificationStatus,
  UpdateLeadInput,
} from '@/types'
import type { CrudClient } from './resource'

export interface ChangeLeadStatusInput {
  statusId: string
  /** Required when the target status is of type `lost`. */
  lostReasonId?: string
  note?: string
}

export interface MoveLeadStageInput {
  stageId: string
  /** Fractional index inside the destination column. Omitted appends the card. */
  position?: number
  /** Required when the target stage is of type `lost`. */
  lostReasonId?: string
  note?: string
}

export interface ImportLeadsOptions {
  /** Skip rows that match an existing lead instead of importing them flagged as duplicates. */
  skipDuplicates?: boolean
}

export interface ConvertToCustomerInput {
  name?: string
  phone?: string | null
  email?: string | null
  companyName?: string | null
  location?: string | null
  /** Moves the lead to this won status in the same request. */
  statusId?: string
  deal?: Omit<CreateDealInput, 'leadId'> | null
}

export interface ConvertToCustomerResult {
  lead: Lead
  customer: Customer
  company: Company | null
  deal: Deal | null
}

export interface SaveQualificationInput {
  qualificationStatus: QualificationStatus
  qualificationAnswers: Record<string, AnswerValue>
  notes?: string
}

export interface UpdateNoteInput {
  text: string
}

export interface LeadRelations {
  linked: LeadSummary[]
  mergedFrom: LeadSummary[]
}

export interface LeadsApiClient extends CrudClient<
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  LeadListParams,
  LeadId
> {
  assign(id: LeadId, userId: string, note?: string): Promise<Lead>
  bulkAssign(ids: LeadId[], userId: string): Promise<Lead[]>
  /** Marking a lead lost requires `lostReasonId`. */
  changeStatus(id: LeadId, input: ChangeLeadStatusInput): Promise<Lead>
  /** Moving into a lost stage requires `lostReasonId`. Won and invalid stages also update status. */
  moveStage(id: LeadId, input: MoveLeadStageInput): Promise<Lead>
  /** Column totals for the leads board. Value is the lead budget. */
  getStageSummary(params?: LeadListParams): Promise<DealsSummary>
  bulkChangeStatus(ids: LeadId[], input: ChangeLeadStatusInput): Promise<Lead[]>
  addTags(ids: LeadId[], tags: string[]): Promise<Lead[]>
  removeTags(ids: LeadId[], tags: string[]): Promise<Lead[]>
  /** Apply workspace assignment rules (round-robin / workload) to each lead. */
  autoAssign(ids: LeadId[]): Promise<Lead[]>
  bulkDelete(ids: LeadId[]): Promise<void>

  /** Matches across the whole workspace, not just the leads the caller may open. */
  checkDuplicates(probe: DuplicateProbe, excludeId?: LeadId): Promise<DuplicateMatch[]>
  listDuplicateGroups(): Promise<DuplicateGroup[]>
  merge(primaryId: LeadId, secondaryId: LeadId, fieldChoices?: LeadMergeChoices): Promise<Lead>
  /** "Keep Separate": clears the duplicate flag between two leads. */
  keepSeparate(id: LeadId, otherId: LeadId): Promise<Lead>
  /** "Link Records": flags `id` as a duplicate of `targetId` without merging. */
  linkDuplicate(id: LeadId, targetId: LeadId): Promise<Lead>

  /** Rows are already parsed and mapped client-side; each runs the full create pipeline. */
  import(rows: CreateLeadInput[], options?: ImportLeadsOptions): Promise<ImportLeadsResult>
  /** Every lead matching `params`, ignoring pagination. Requires the export permission. */
  exportRows(params?: LeadListParams): Promise<Lead[]>

  /** Creates a customer (and company) from the lead. The lead and its history are kept. */
  convertToCustomer(id: LeadId, input?: ConvertToCustomerInput): Promise<ConvertToCustomerResult>
  convertToDeal(id: LeadId, input: Omit<CreateDealInput, 'leadId'>): Promise<Deal>

  /** Re-runs scoring and writes `score_changed` when the number moves. */
  recalculateScore(id: LeadId): Promise<Lead>
  /** Stores answers, updates qualificationStatus, and writes a note. */
  saveQualification(id: LeadId, input: SaveQualificationInput): Promise<Lead>

  listActivities(id: LeadId, params?: ActivityListParams): Promise<Paginated<Activity>>
  addActivity(id: LeadId, input: ManualActivityInput): Promise<Activity>
  listPinnedNotes(id: LeadId): Promise<Activity[]>
  /** Author-only. */
  updateNote(id: LeadId, activityId: string, input: UpdateNoteInput): Promise<Activity>
  deleteNote(id: LeadId, activityId: string): Promise<void>
  setNotePinned(id: LeadId, activityId: string, pinned: boolean): Promise<Activity>

  /** Linked duplicates and leads that were merged into this one. */
  getRelations(id: LeadId): Promise<LeadRelations>
}
