import type { CallLog, CallLogListParams, CreateCallLogInput, Paginated } from '@/types'

export interface CallLogsApiClient {
  list(params?: CallLogListParams): Promise<Paginated<CallLog>>
  create(input: CreateCallLogInput): Promise<CallLog>
  updateNotes(id: string, notes: string): Promise<CallLog>
}
