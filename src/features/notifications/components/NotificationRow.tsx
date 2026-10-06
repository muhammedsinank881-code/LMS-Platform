import { Link } from 'react-router-dom'
import { Mail, MailOpen, Trash2 } from 'lucide-react'
import { Button, Checkbox, Tooltip } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatRelative, formatDateTime } from '@/lib/format'
import type { Notification } from '@/types'
import { NOTIFICATION_META } from '../lib/notification-meta'

/** One notification: the whole card opens its deep link; the actions sit beside it. */
export function NotificationRow({
  item,
  selected,
  onSelect,
  onOpen,
  onToggleRead,
  onDelete,
}: {
  item: Notification
  selected: boolean
  onSelect: (checked: boolean) => void
  onOpen: () => void
  onToggleRead: () => void
  onDelete: () => void
}) {
  const meta = NOTIFICATION_META[item.type]
  const Icon = meta.icon
  const unread = item.readAt === null
  return (
    <li className={cn('group flex items-start gap-3 px-3 py-3 transition-colors sm:px-4', unread ? 'bg-primary/5' : 'hover:bg-muted/50')}>
      <Checkbox checked={selected} onCheckedChange={(checked) => onSelect(checked === true)} aria-label={`Select ${item.title}`} className="mt-2.5" />
      <Link
        to={item.link}
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-start gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', meta.tone)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className={cn('truncate text-sm', unread ? 'font-semibold' : 'font-medium')}>{item.title}</span>
            <time dateTime={item.createdAt} title={formatDateTime(item.createdAt)} className="shrink-0 text-xs text-muted-foreground">
              {formatRelative(item.createdAt)}
            </time>
          </span>
          <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{item.body}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{meta.label}</span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:focus-within:opacity-100 sm:group-hover:opacity-100">
        <Tooltip content={unread ? 'Mark as read' : 'Mark as unread'}>
          <Button type="button" size="icon-sm" variant="ghost" aria-label={unread ? `Mark ${item.title} as read` : `Mark ${item.title} as unread`} onClick={onToggleRead}>
            {unread ? <MailOpen /> : <Mail />}
          </Button>
        </Tooltip>
        <Tooltip content="Delete">
          <Button type="button" size="icon-sm" variant="ghost" aria-label={`Delete ${item.title}`} onClick={onDelete}>
            <Trash2 />
          </Button>
        </Tooltip>
      </div>
      {unread ? <span className="mt-4 h-2 w-2 shrink-0 rounded-full bg-primary" role="img" aria-label="Unread" /> : null}
    </li>
  )
}
