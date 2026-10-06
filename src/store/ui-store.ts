import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FollowUpType } from '@/types'

export interface FollowUpComposerDraft {
  leadIds: string[]
  lockLead: boolean
  dueAt?: string
  assigneeId?: string
  type?: FollowUpType
  dealId?: string
}

interface UiState {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  followUpDraft: FollowUpComposerDraft | null
  toggleSidebar: () => void
  setCommandPaletteOpen: (open: boolean) => void
  openFollowUp: (draft?: Partial<FollowUpComposerDraft>) => void
  closeFollowUp: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      followUpDraft: null,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      openFollowUp: (draft) =>
        set({
          followUpDraft: {
            leadIds: draft?.leadIds ?? [],
            lockLead: draft?.lockLead ?? false,
            dueAt: draft?.dueAt,
            assigneeId: draft?.assigneeId,
            type: draft?.type,
            dealId: draft?.dealId,
          },
        }),
      closeFollowUp: () => set({ followUpDraft: null }),
    }),
    {
      name: 'leadflow-ui',
      version: 1,
      partialize: ({ sidebarCollapsed }) => ({ sidebarCollapsed }),
    },
  ),
)
