import { createContext, useContext, useEffect, useState } from 'react'

export interface SaveState {
  dirty: boolean
  saving: boolean
  save: () => void
  discard: () => void
}

export const SaveBarContext = createContext<{
  setSave: (state: SaveState | null) => void
} | null>(null)

export function useSaveBar() {
  const context = useContext(SaveBarContext)
  if (!context) throw new Error('useSaveBar must be used inside settings')
  return context
}

export function useSaveBarState() {
  return useState<SaveState | null>(null)
}

export function useRegisterSave(state: SaveState | null) {
  const { setSave } = useSaveBar()
  useEffect(() => {
    setSave(state)
    return () => setSave(null)
  }, [setSave, state])
}
