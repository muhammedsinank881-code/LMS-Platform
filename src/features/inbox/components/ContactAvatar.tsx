import { Avatar } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { Channel } from '@/types'
import { ChannelIcon } from './ChannelIcon'

const SIZE = { sm: 'sm', md: 'md' } as const

/** Initials avatar with a small channel badge, the way chat apps show who is on which channel. */
export function ContactAvatar({
  name,
  channel,
  size = 'md',
  className,
}: {
  name: string
  channel: Channel
  size?: keyof typeof SIZE
  className?: string
}) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <Avatar name={/[a-z]/i.test(name) ? name : '?'} size={SIZE[size]} />
      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-surface bg-surface">
        <ChannelIcon channel={channel} className="h-2.5 w-2.5" />
      </span>
    </span>
  )
}
