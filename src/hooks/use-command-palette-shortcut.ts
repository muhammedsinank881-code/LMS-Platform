import { useEffect } from 'react'
import { useUiStore } from '@/store/ui-store'

/** Toggles the command palette on Cmd+K (macOS) / Ctrl+K (elsewhere). */
export function useCommandPaletteShortcut() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore.getState()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
