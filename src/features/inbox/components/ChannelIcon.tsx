import { Mail, MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Channel } from '@/types'
import { channelLabel } from '../lib/channel'

const META: Record<Channel, { icon: typeof Phone; className: string }> = {
  whatsapp: { icon: MessageCircle, className: 'text-success' },
  email: { icon: Mail, className: 'text-info' },
  call: { icon: Phone, className: 'text-primary' },
}

export function ChannelIcon({
  channel,
  className,
}: {
  channel: Channel
  className?: string
}) {
  const meta = META[channel]
  const Icon = meta.icon
  return <Icon aria-label={channelLabel(channel)} className={cn('h-4 w-4', meta.className, className)} />
}
