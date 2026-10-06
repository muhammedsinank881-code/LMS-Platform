import { useEffect, useRef, useState } from 'react'

/**
 * Always-mounted live region. It announces a new customer message to screen readers, but
 * never the history that loads when a conversation opens.
 */
export function MessageAnnouncer({
  conversationId,
  messageId,
  text,
}: {
  conversationId: string
  messageId: string | null
  text: string
}) {
  const [announcement, setAnnouncement] = useState('')
  const last = useRef({ conversationId: '', messageId: '' as string | null })

  useEffect(() => {
    const previous = last.current
    if (previous.conversationId === conversationId && messageId && previous.messageId !== messageId) {
      setAnnouncement(`New message: ${text}`)
    } else if (previous.conversationId !== conversationId) {
      setAnnouncement('')
    }
    last.current = { conversationId, messageId }
  }, [conversationId, messageId, text])

  return (
    <div role="log" aria-live="polite" aria-relevant="additions" className="sr-only">
      {announcement}
    </div>
  )
}
