import { useEffect, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { MessageSquareText } from 'lucide-react'
import { QueryState } from '@/components/common/QueryState'
import { Button, Skeleton } from '@/components/ui'
import { useDirectory } from '@/features/team/hooks/use-team'
import { contactLabel } from '@/lib/inbox/auto-link'
import { htmlToText } from '@/lib/inbox/sanitize-html'
import type { Conversation } from '@/types'
import { useCallLogs } from '../hooks/use-call-logs'
import { useMessages, useRetryMessage } from '../hooks/use-conversations'
import { CallCard } from './bubbles/CallCard'
import { DateSeparator } from './bubbles/DateSeparator'
import { renderMessageBubble, sameDay, type BubbleContext, type ThreadItem } from './bubbles/bubble-map'
import { MessageAnnouncer } from './MessageAnnouncer'

const NEAR_BOTTOM_PX = 240

function ThreadSkeleton() {
  return (
    <div className="space-y-4 p-4" aria-label="Loading messages">
      <Skeleton className="h-12 w-2/3 rounded-lg" />
      <Skeleton className="ml-auto h-16 w-1/2 rounded-lg" />
      <Skeleton className="h-10 w-1/3 rounded-lg" />
    </div>
  )
}

export function ThreadMessages({ conversation }: { conversation: Conversation }) {
  const messages = useMessages(conversation.id)
  const calls = useCallLogs({
    filters: [{ field: 'conversationId', operator: 'equals', value: conversation.id }],
    pageSize: 50,
  })
  const retry = useRetryMessage()
  const directory = useDirectory()
  const userNames = useMemo(() => new Map((directory.data ?? []).map((user) => [user.id, user.name])), [directory.data])
  const contactName = contactLabel({ contactName: conversation.contactName, contactPhone: conversation.contactPhone, contactEmail: conversation.contactEmail })
  const items = useMemo(() => {
    const rows: ThreadItem[] = (messages.data?.messages ?? []).map((message) => ({
      kind: 'message' as const,
      id: message.id,
      at: message.sentAt,
      message,
    }))
    for (const log of calls.data?.items ?? []) rows.push({ kind: 'call', id: log.id, at: log.startedAt, log })
    return rows.sort((a, b) => a.at.localeCompare(b.at))
  }, [calls.data?.items, messages.data?.messages])

  const scroller = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scroller.current,
    getItemKey: (index) => items[index]?.id ?? index,
    estimateSize: () => 96,
    overscan: 8,
  })

  const firstId = items[0]?.id
  const lastItem = items[items.length - 1]
  const seen = useRef({ conversation: '', first: '', last: '', count: 0 })

  useEffect(() => {
    if (items.length === 0) return
    const previous = seen.current
    const element = scroller.current
    const nearBottom = element
      ? element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_PX
      : true
    if (previous.conversation !== conversation.id) {
      virtualizer.scrollToIndex(items.length - 1, { align: 'end' })
    } else if (previous.first !== firstId && previous.last === lastItem?.id) {
      // Older messages were added above: keep the reader where they were.
      virtualizer.scrollToIndex(items.length - previous.count, { align: 'start' })
    } else if (previous.last !== lastItem?.id) {
      const mine = lastItem?.kind === 'message' && lastItem.message.direction === 'outbound'
      if (nearBottom || mine) virtualizer.scrollToIndex(items.length - 1, { align: 'end' })
    }
    seen.current = { conversation: conversation.id, first: firstId ?? '', last: lastItem?.id ?? '', count: items.length }
  }, [conversation.id, firstId, items.length, lastItem, virtualizer])

  const latestInbound = [...(messages.data?.messages ?? [])]
    .reverse()
    .find((message) => message.direction === 'inbound' && !message.isInternalNote)

  return (
    <QueryState
      isLoading={messages.isLoading || calls.isLoading}
      isError={messages.isError || calls.isError}
      onRetry={() => {
        void messages.refetch()
        void calls.refetch()
      }}
      isEmpty={items.length === 0}
      loading={<ThreadSkeleton />}
      emptyIcon={MessageSquareText}
      emptyTitle="No messages yet"
      emptyDescription="Send the first message or log a call."
    >
      <div className="relative h-full">
        <MessageAnnouncer
          conversationId={conversation.id}
          messageId={latestInbound?.id ?? null}
          text={latestInbound ? htmlToText(latestInbound.body) : ''}
        />
        <div ref={scroller} className="h-full overflow-y-auto px-3 py-3 sm:px-6" tabIndex={-1}>
          {messages.hasNextPage ? (
            <div className="flex justify-center pb-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                loading={messages.isFetchingNextPage}
                onClick={() => void messages.fetchNextPage()}
              >
                Load earlier messages
              </Button>
            </div>
          ) : null}
          <div className="relative mx-auto max-w-3xl" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((row) => {
              const item = items[row.index]
              const previous = items[row.index - 1]
              if (!item) return null
              return (
                <div
                  key={row.key}
                  data-index={row.index}
                  ref={virtualizer.measureElement}
                  className="absolute inset-x-0 pb-2"
                  style={{ transform: `translateY(${row.start}px)` }}
                >
                  {!previous || !sameDay(previous.at, item.at) ? <DateSeparator value={item.at} /> : null}
                  {item.kind === 'call' ? (
                    <CallCard log={item.log} />
                  ) : (
                    renderMessageBubble(item.message, {
                      onRetry: (messageId) => retry.mutate({ id: conversation.id, messageId }),
                      isLast: row.index === items.length - 1,
                      contactName,
                      contactEmail: conversation.contactEmail,
                      userName: (id) => (id ? (userNames.get(id) ?? "Team member") : "Team member"),
                    } satisfies BubbleContext)
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </QueryState>
  )
}
