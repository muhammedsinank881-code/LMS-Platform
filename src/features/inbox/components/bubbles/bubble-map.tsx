import type { ReactNode } from 'react'
import type { CallLog, Channel, Message, MessageType } from '@/types'
import { EmailMessage } from './EmailMessage'
import { NoteBubble } from './NoteBubble'
import { TemplateBubble } from './TemplateBubble'
import { WhatsAppBubble } from './WhatsAppBubble'

/** What a renderer needs besides the message itself. */
export interface BubbleContext {
  onRetry?: (messageId: string) => void
  /** The newest message of the thread. Email threads open it and collapse the rest. */
  isLast: boolean
  contactName: string
  contactEmail: string | null
  userName: (id: string | null) => string
}

type Renderer = (message: Message, context: BubbleContext) => ReactNode

const chat: Renderer = (message, context) => <WhatsAppBubble message={message} onRetry={context.onRetry} />

/** One renderer per message type. Text, image, document and audio share the chat bubble. */
const BY_TYPE: Record<MessageType, Renderer> = {
  text: chat,
  image: chat,
  document: chat,
  audio: chat,
  template: (message, context) => <TemplateBubble message={message} onRetry={context.onRetry} />,
  note: (message) => <NoteBubble message={message} />,
}

/** Channels that lay messages out differently from a chat bubble. */
const BY_CHANNEL: Partial<Record<Channel, Renderer>> = {
  email: (message, context) => <EmailMessage message={message} context={context} />,
}

export function renderMessageBubble(message: Message, context: BubbleContext): ReactNode {
  if (message.isInternalNote || message.type === 'note') return BY_TYPE.note(message, context)
  const channelRenderer = BY_CHANNEL[message.channel]
  if (channelRenderer) return channelRenderer(message, context)
  return BY_TYPE[message.type](message, context)
}

export function sameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

export type ThreadItem =
  | { kind: 'message'; id: string; at: string; message: Message }
  | { kind: 'call'; id: string; at: string; log: CallLog }
