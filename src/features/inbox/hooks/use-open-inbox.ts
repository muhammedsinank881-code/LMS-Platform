import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Channel, LeadId } from '@/types'
import { useStartConversation } from './use-conversations'

export function useOpenInbox() {
  const start = useStartConversation()
  const navigate = useNavigate()
  const open = useCallback(
    async (leadId: LeadId, channel: Channel) => {
      const conversation = await start.mutateAsync({ leadId, channel })
      navigate(`/inbox/${conversation.id}`)
    },
    [navigate, start],
  )
  return { open, isPending: start.isPending }
}
