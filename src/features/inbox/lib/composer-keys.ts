import type { KeyboardEvent } from 'react'

export function handleComposerKey(
  event: KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>,
  enterToSend: boolean,
  send: () => void,
): void {
  if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
  if (enterToSend && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}
