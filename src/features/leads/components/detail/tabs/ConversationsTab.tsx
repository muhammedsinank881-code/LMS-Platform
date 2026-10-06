import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Mail, MessageCircle, Phone, type LucideIcon } from 'lucide-react'
import { QueryState } from '@/components/common/QueryState'
import { Button } from '@/components/ui'
import { ThreadComposer, type ComposerTab } from '@/features/inbox/components/ThreadComposer'
import { ThreadMessages } from '@/features/inbox/components/ThreadMessages'
import { useConversations, useStartConversation } from '@/features/inbox/hooks/use-conversations'
import { useDirectory } from '@/features/team/hooks/use-team'
import { usePermission } from '@/hooks/use-permission'
import { cn } from '@/lib/cn'
import type { Channel, Conversation, Lead } from '@/types'

const CHANNELS: Array<{ channel: Channel; label: string; icon: LucideIcon }> = [
  { channel: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { channel: 'email', label: 'Email', icon: Mail },
  { channel: 'call', label: 'Calls', icon: Phone },
]

function hasContact(lead: Lead, channel: Channel): boolean {
  return channel === 'email' ? Boolean(lead.email) : Boolean(lead.whatsapp ?? lead.phone)
}

function Thread({ conversation, lead }: { conversation: Conversation; lead: Lead }) {
  const [tab, setTab] = useState<ComposerTab>(conversation.channel === 'call' ? 'call' : 'compose')
  const directory = useDirectory()
  const owner = (directory.data ?? []).find((user) => user.id === (lead.assignedTo ?? conversation.assignedTo))
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <p className="min-w-0 truncate text-sm text-muted-foreground">
          {conversation.status === 'closed' ? 'Closed · ' : ''}
          {conversation.contactPhone ?? conversation.contactEmail}
        </p>
        <Button asChild size="sm" variant="ghost">
          <Link to={`/inbox/${conversation.id}`}>
            Open in Inbox <ExternalLink />
          </Link>
        </Button>
      </div>
      <div className="h-96 bg-background">
        <ThreadMessages conversation={conversation} />
      </div>
      <div className="border-t border-border">
        <ThreadComposer conversation={conversation} lead={lead} owner={owner} tab={tab} onTabChange={setTab} />
      </div>
    </div>
  )
}

/** A lead's conversations across channels, with the real thread and composer inline. */
export function ConversationsTab({ lead }: { lead: Lead }) {
  const conversations = useConversations({
    filters: [{ field: 'leadId', operator: 'equals', value: lead.id }],
    pageSize: 20,
  })
  const start = useStartConversation()
  const { can } = usePermission()
  const [picked, setPicked] = useState<Channel | null>(null)
  const items = conversations.data?.items ?? []
  const byChannel = (channel: Channel) => items.find((item) => item.channel === channel)
  const active = picked ?? CHANNELS.find((item) => byChannel(item.channel))?.channel ?? null
  const selected = active ? byChannel(active) : undefined

  const choose = (channel: Channel) => {
    setPicked(channel)
    if (byChannel(channel)) return
    start.mutate({ leadId: lead.id, channel })
  }

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Channel" className="flex flex-wrap gap-2">
        {CHANNELS.map(({ channel, label, icon: Icon }) => {
          const existing = byChannel(channel)
          const unavailable = !existing && (!hasContact(lead, channel) || !can('inbox', 'create'))
          return (
            <button
              key={channel}
              type="button"
              role="tab"
              aria-selected={active === channel}
              disabled={unavailable || start.isPending}
              title={unavailable ? `This lead has no ${channel === 'email' ? 'email address' : 'phone number'}` : undefined}
              onClick={() => choose(channel)}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 max-sm:h-11',
                active === channel ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
              {existing && existing.unreadCount > 0 ? (
                <span className="rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">{existing.unreadCount}</span>
              ) : null}
              {!existing && !unavailable ? <span className="text-xs font-normal text-muted-foreground">Start</span> : null}
            </button>
          )
        })}
      </div>
      <QueryState
        isLoading={conversations.isLoading}
        isError={conversations.isError}
        onRetry={() => void conversations.refetch()}
        isEmpty={items.length === 0 && !start.isPending}
        emptyTitle="No conversations yet"
        emptyDescription="Start a WhatsApp, email or call thread with this lead using the buttons above."
      >
        {selected ? <Thread key={selected.id} conversation={selected} lead={lead} /> : null}
      </QueryState>
    </div>
  )
}
