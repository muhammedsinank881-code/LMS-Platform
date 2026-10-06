import type { QuickReply, QuickReplyInput } from '@/types'
import type { ConfigClient } from './resource'

export type QuickRepliesApiClient = ConfigClient<
  QuickReply,
  QuickReplyInput,
  Partial<QuickReplyInput>
>
