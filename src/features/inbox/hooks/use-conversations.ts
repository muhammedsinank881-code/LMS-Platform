import { keepPreviousData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type {
  Channel,
  ConversationListParams,
  CreateLeadFromConversationInput,
  EmailDraftInput,
  LeadId,
  SendMessageInput,
} from '@/types'

export function useConversations(params?: ConversationListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.conversations.list(params),
    queryFn: () => api.conversations.list(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useInboxUnreadCount() {
  const query = useConversations({
    filters: [{ field: 'unreadCount', operator: 'gt', value: 0 }],
    pageSize: 1,
  })
  return query.data?.total ?? 0
}

export function useConversation(id: string | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.conversations.detail(id ?? ''),
    queryFn: () => api.conversations.get(id ?? ''),
    enabled: ready && Boolean(id),
  })
}

const MESSAGE_PAGE = 40

/** Newest page first; `fetchNextPage` walks back in time. Pages are merged oldest → newest. */
export function useMessages(conversationId: string | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useInfiniteQuery({
    queryKey: keys.conversations.messages(conversationId ?? '', { pageSize: MESSAGE_PAGE }),
    queryFn: ({ pageParam }) =>
      api.conversations.listMessages(conversationId ?? '', { page: pageParam, pageSize: MESSAGE_PAGE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.pageCount ? last.page + 1 : undefined),
    select: (data) => ({
      messages: [...new Map([...data.pages].reverse().flatMap((page) => [...page.items].reverse()).map((m) => [m.id, m])).values()],
      total: data.pages[0]?.total ?? 0,
    }),
    enabled: ready && Boolean(conversationId),
    refetchInterval: (query) => {
      const first = query.state.data?.pages[0]?.items ?? []
      const moving = first.some(
        (message) =>
          message.direction === 'outbound' &&
          !message.isInternalNote &&
          ((message.channel === 'whatsapp' && (message.status === 'sent' || message.status === 'delivered')) ||
            (message.channel === 'email' && message.status === 'sent')),
      )
      return moving ? 1000 : false
    },
  })
}

export function useSendMessage() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SendMessageInput }) =>
      api.conversations.sendMessage(id, input),
    onSuccess: () => invalidate('conversations', 'leads', 'notifications'),
    meta: { errorTitle: 'Could not send message' },
  })
}

export function useRetryMessage() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, messageId }: { id: string; messageId: string }) =>
      api.conversations.retryMessage(id, messageId),
    onSuccess: () => invalidate('conversations'),
    meta: { errorTitle: 'Could not retry message' },
  })
}

export function useAddInternalNote() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      api.conversations.addInternalNote(id, body),
    onSuccess: () => invalidate('conversations'),
    meta: { errorTitle: 'Could not save note' },
  })
}

export function useSaveDraft() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, draft }: { id: string; draft: EmailDraftInput | null }) =>
      api.conversations.saveDraft(id, draft),
    onSuccess: () => invalidate('conversations'),
    meta: { silent: true },
  })
}

export function useMarkConversationRead() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.conversations.markRead(id),
    onSuccess: () => invalidate('conversations'),
    meta: { silent: true },
  })
}

export function useAssignConversation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string | null }) =>
      api.conversations.assign(id, userId),
    onSuccess: () => invalidate('conversations'),
    meta: { errorTitle: 'Could not assign conversation' },
  })
}

export function useStartConversation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ leadId, channel }: { leadId: LeadId; channel: Channel }) =>
      api.conversations.startForLead(leadId, channel),
    onSuccess: () => invalidate('conversations'),
    meta: { errorTitle: 'Could not start conversation' },
  })
}

export function useCloseConversation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.conversations.close(id),
    onSuccess: () => invalidate('conversations'),
    meta: { errorTitle: 'Could not close conversation' },
  })
}

export function useReopenConversation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.conversations.reopen(id),
    onSuccess: () => invalidate('conversations'),
    meta: { errorTitle: 'Could not reopen conversation' },
  })
}

export function useLinkConversation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, leadId }: { id: string; leadId: LeadId }) =>
      api.conversations.linkToLead(id, leadId),
    onSuccess: () => invalidate('conversations', 'leads'),
    meta: { errorTitle: 'Could not link lead' },
  })
}

export function useCreateLeadFromConversation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: CreateLeadFromConversationInput }) =>
      api.conversations.createLeadFromConversation(id, input),
    onSuccess: () => invalidate('conversations', 'leads'),
    meta: { errorTitle: 'Could not create lead' },
  })
}
