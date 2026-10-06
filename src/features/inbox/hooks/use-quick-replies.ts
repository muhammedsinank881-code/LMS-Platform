import { api } from '@/services'
import { createConfigHooks } from '@/hooks/create-config-hooks'

const quickReplies = createConfigHooks({
  name: 'quickReplies',
  label: 'quick reply',
  client: api.quickReplies,
})

export const useQuickReplies = quickReplies.useList
export const useCreateQuickReply = quickReplies.useCreate
export const useUpdateQuickReply = quickReplies.useUpdate
export const useDeleteQuickReply = quickReplies.useDelete
