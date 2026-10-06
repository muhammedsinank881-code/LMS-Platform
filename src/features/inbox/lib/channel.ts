import type { Channel } from '@/types'

export const CHANNEL_LABEL: Record<Channel, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  call: 'Call',
}

export function channelLabel(channel: Channel): string {
  return CHANNEL_LABEL[channel]
}
