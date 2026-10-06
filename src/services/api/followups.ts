import type {
  CompleteFollowUpInput,
  CreateFollowUpInput,
  FollowUp,
  FollowUpBuckets,
  FollowUpListParams,
  RescheduleFollowUpInput,
  UpdateFollowUpInput,
} from '@/types'
import type { CrudClient } from './resource'

export interface FollowUpsApiClient extends CrudClient<
  FollowUp,
  CreateFollowUpInput,
  UpdateFollowUpInput,
  FollowUpListParams
> {
  complete(id: string, input?: CompleteFollowUpInput): Promise<FollowUp>
  reschedule(id: string, input: RescheduleFollowUpInput): Promise<FollowUp>
  /** Pushes the due time forward by `minutes`. */
  snooze(id: string, minutes: number): Promise<FollowUp>
  /** Overdue / today / tomorrow / upcoming counts for the follow-ups the caller may see. */
  getBuckets(params?: FollowUpListParams): Promise<FollowUpBuckets>
}
