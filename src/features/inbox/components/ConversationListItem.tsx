import { NavLink } from 'react-router-dom'
import { Avatar } from '@/components/ui'
import { contactLabel } from '@/lib/inbox/auto-link'
import { formatRelativeShort } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { Conversation } from '@/types'
import { ContactAvatar } from './ContactAvatar'

export function ConversationListItem({
  conversation,
  assigneeName,
}: {
  conversation: Conversation
  assigneeName?: string | null
}) {
  const name = contactLabel({
    contactName: conversation.contactName,
    contactPhone: conversation.contactPhone,
    contactEmail: conversation.contactEmail,
  })
  const unread = conversation.unreadCount > 0
  const closed = conversation.status === 'closed'
  return (
    <NavLink
      to={`/inbox/${conversation.id}`}
      aria-label={`${name}${unread ? `, ${conversation.unreadCount} unread` : ''}`}
      className={({ isActive }) =>
        cn(
          'group relative flex gap-3 border-l-2 px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
          isActive ? 'border-l-primary bg-primary/5' : 'border-l-transparent hover:bg-muted/60',
          closed && 'opacity-70',
        )
      }
    >
      <ContactAvatar name={name} channel={conversation.channel} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn('truncate text-sm text-foreground', unread ? 'font-semibold' : 'font-medium')}>{name}</p>
          <time
            dateTime={conversation.lastMessageAt}
            className={cn('shrink-0 text-xs', unread ? 'font-medium text-primary' : 'text-muted-foreground')}
          >
            {formatRelativeShort(conversation.lastMessageAt)}
          </time>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <p className={cn('min-w-0 flex-1 truncate text-sm', unread ? 'text-foreground' : 'text-muted-foreground')}>
            {conversation.lastMessagePreview || 'No messages yet'}
          </p>
          {unread ? (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {conversation.unreadCount}
            </span>
          ) : null}
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          {assigneeName ? (
            <span className="inline-flex items-center gap-1.5">
              <Avatar name={assigneeName} size="xs" className="!h-4 !w-4 !text-[9px]" />
              <span className="max-w-24 truncate">{assigneeName}</span>
            </span>
          ) : (
            <span className="rounded bg-warning/15 px-1.5 py-0.5 font-medium text-foreground">Unassigned</span>
          )}
          {!conversation.leadId ? <span className="rounded bg-muted px-1.5 py-0.5">No lead</span> : null}
          {closed ? <span className="rounded bg-muted px-1.5 py-0.5">Closed</span> : null}
        </div>
      </div>
    </NavLink>
  )
}
