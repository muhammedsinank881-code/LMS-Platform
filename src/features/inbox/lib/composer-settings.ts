import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ComposerSettings {
  enterToSend: boolean
  setEnterToSend: (value: boolean) => void
}

export const useComposerSettings = create<ComposerSettings>()(
  persist(
    (set) => ({
      enterToSend: true,
      setEnterToSend: (enterToSend) => set({ enterToSend }),
    }),
    { name: 'leadflow-composer' },
  ),
)
