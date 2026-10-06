import type {
  AudienceCount,
  Broadcast,
  BroadcastAudience,
  BroadcastInput,
  BroadcastPreview,
  VariableMap,
} from '@/types'

/** WhatsApp broadcasts. Sending is simulated: nothing leaves the mock backend. */
export interface BroadcastsApiClient {
  list(): Promise<Broadcast[]>
  get(id: string): Promise<Broadcast>
  /** Eligible leads are those in the audience that have not opted out of WhatsApp. */
  audienceCount(audience: BroadcastAudience): Promise<AudienceCount>
  preview(templateId: string, variableMap: VariableMap, audience: BroadcastAudience): Promise<BroadcastPreview>
  /** Starts sending now, or schedules it. Needs the send-broadcasts permission. */
  create(input: BroadcastInput): Promise<Broadcast>
  cancel(id: string): Promise<Broadcast>
}
