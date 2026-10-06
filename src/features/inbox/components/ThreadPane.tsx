import { useEffect, useRef, useState } from 'react'
import { MessagesSquare } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QueryState } from '@/components/common/QueryState'
import { EmptyState } from '@/components/ui'
import { telHref } from '@/features/leads/lib/contact-links'
import { useLead } from '@/features/leads/hooks/use-leads'
import { useDirectory } from '@/features/team/hooks/use-team'
import type { Conversation } from '@/types'
import { useConversation, useMarkConversationRead } from '../hooks/use-conversations'
import { ThreadComposer, type ComposerTab } from './ThreadComposer'
import { ThreadHeader } from './ThreadHeader'
import { ThreadMessages } from './ThreadMessages'

interface PaneProps {
  showBack: boolean
  showInfoButton: boolean
  onOpenInfo: () => void
}

export function ThreadPane({ conversationId, ...pane }: PaneProps & { conversationId: string | null }) {
  const query = useConversation(conversationId)
  const markRead = useMarkConversationRead()
  const lead = useLead(query.data?.leadId)
  const directory = useDirectory()
  const conversation = query.data
  const marked = useRef('')

  useEffect(() => {
    if (!conversation || conversation.unreadCount === 0 || marked.current === conversation.id) return
    marked.current = conversation.id
    markRead.mutate(conversation.id)
  }, [conversation, markRead])

  if (!conversationId) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={MessagesSquare}
          title="Select a conversation"
          description="Pick a thread from the list to read it and reply."
        />
      </div>
    )
  }

  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()}>
      {conversation ? (
        <ThreadReady
          key={conversation.id}
          conversation={conversation}
          lead={lead.data}
          members={(directory.data ?? []).map((user) => ({ id: user.id, name: user.name }))}
          {...pane}
        />
      ) : null}
    </QueryState>
  )
}

function ThreadReady({
  conversation,
  lead,
  members,
  ...pane
}: PaneProps & {
  conversation: Conversation
  lead?: ReturnType<typeof useLead>['data']
  members: Array<{ id: string; name: string }>
}) {
  const [logPromptOpen, setLogPromptOpen] = useState(false)
  const [tab, setTab] = useState<ComposerTab>(conversation.channel === 'call' ? 'call' : 'compose')
  const callFormRef = useRef<HTMLDivElement>(null)
  const tel = telHref(conversation.contactPhone)
  const owner = members.find((user) => user.id === (lead?.assignedTo ?? conversation.assignedTo))

  const startCall = () => {
    if (tel) window.open(tel, '_self')
    setLogPromptOpen(true)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ThreadHeader
        conversation={conversation}
        leadName={lead?.name}
        members={members}
        onLogCall={startCall}
        {...pane}
      />
      <div className="min-h-0 flex-1">
        <ThreadMessages conversation={conversation} />
      </div>
      <div className="border-t border-border bg-surface" ref={callFormRef}>
        <ThreadComposer conversation={conversation} lead={lead} owner={owner} tab={tab} onTabChange={setTab} />
      </div>
      <ConfirmDialog
        open={logPromptOpen}
        onOpenChange={setLogPromptOpen}
        title="Log this call?"
        description="Your phone app should have opened. When you are done, add the outcome and notes so the lead's history stays complete."
        confirmLabel="Log the call"
        cancelLabel="Not now"
        onConfirm={() => {
          setLogPromptOpen(false)
          setTab('call')
          window.setTimeout(() => callFormRef.current?.querySelector<HTMLElement>('select, button[role="combobox"], textarea')?.focus(), 50)
        }}
      />
    </div>
  )
}
