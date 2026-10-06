import type { Channel, ConversationStatus } from '@/types'

export interface InboxFilters {
  channel: Channel | 'all'
  unreadOnly: boolean
  assignedToMe: boolean
  unassigned: boolean
  status: ConversationStatus | 'all'
  search: string
  from: string
  to: string
}

export const DEFAULT_INBOX_FILTERS: InboxFilters = {
  channel: 'all',
  unreadOnly: false,
  assignedToMe: false,
  unassigned: false,
  status: 'open',
  search: '',
  from: '',
  to: '',
}
