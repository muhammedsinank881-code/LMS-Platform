import type {
  Channel,
  Conversation,
  ConversationListParams,
  CreateLeadFromConversationInput,
  EmailDraftInput,
  Lead,
  LeadId,
  Message,
  Paginated,
  SendMessageInput,
} from '@/types'
import type { ListParams } from '@/types'

export interface ConversationsApiClient {
  list(params?: ConversationListParams): Promise<Paginated<Conversation>>
  get(id: string): Promise<Conversation>
  listMessages(id: string, params?: ListParams): Promise<Paginated<Message>>
  sendMessage(id: string, input: SendMessageInput): Promise<Message>
  retryMessage(id: string, messageId: string): Promise<Message>
  addInternalNote(id: string, body: string): Promise<Message>
  saveDraft(id: string, draft: EmailDraftInput | null): Promise<Conversation>
  markRead(id: string): Promise<Conversation>
  assign(id: string, userId: string | null): Promise<Conversation>
  close(id: string): Promise<Conversation>
  reopen(id: string): Promise<Conversation>
  linkToLead(id: string, leadId: LeadId): Promise<Conversation>
  createLeadFromConversation(
    id: string,
    input?: CreateLeadFromConversationInput,
  ): Promise<{ conversation: Conversation; lead: Lead }>
  /** Opens the existing conversation on that channel for the lead, or creates one. */
  startForLead(leadId: LeadId, channel: Channel): Promise<Conversation>
}
