import { Inbox, SearchX } from 'lucide-react'
import { QueryState } from '@/components/common/QueryState'
import { Skeleton } from '@/components/ui'
import { useConversations } from '../hooks/use-conversations'
import { inboxListParams } from '../lib/list-params'
import { DEFAULT_INBOX_FILTERS, type InboxFilters } from '../lib/inbox-filters'
import { ConversationListItem } from './ConversationListItem'

function ListSkeleton() {
  return (
    <div className="divide-y divide-border" aria-busy="true" aria-label="Loading conversations">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex gap-3 px-3 py-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ConversationList({
  filters,
  userId,
  users,
}: {
  filters: InboxFilters
  userId: string
  users: Record<string, string>
}) {
  const query = useConversations(inboxListParams(filters, userId))
  const items = query.data?.items ?? []
  const filtered =
    JSON.stringify({ ...filters, channel: 'all' }) !== JSON.stringify({ ...DEFAULT_INBOX_FILTERS })
  return (
    <QueryState
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => void query.refetch()}
      isEmpty={items.length === 0}
      loading={<ListSkeleton />}
      emptyIcon={filtered ? SearchX : Inbox}
      emptyTitle={filtered ? 'No matching conversations' : 'No conversations yet'}
      emptyDescription={
        filtered
          ? 'Try a different search or clear a filter.'
          : 'Incoming WhatsApp, email and calls will show up here.'
      }
    >
      <ul className="divide-y divide-border" aria-label="Conversations">
        {items.map((conversation) => (
          <li key={conversation.id}>
            <ConversationListItem
              conversation={conversation}
              assigneeName={conversation.assignedTo ? users[conversation.assignedTo] : null}
            />
          </li>
        ))}
      </ul>
    </QueryState>
  )
}
