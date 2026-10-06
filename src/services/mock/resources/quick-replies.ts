import type { QuickRepliesApiClient } from '@/services/api/quick-replies'
import type { QuickReplyInput } from '@/types'
import { createConfigApi, requireText } from '../core/config-crud'

function shortcutOf(value: string): string {
  const raw = value.trim()
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`
  return withSlash.toLowerCase().replace(/[^a-z0-9/_-]/g, '')
}

export const mockQuickRepliesApi: QuickRepliesApiClient = createConfigApi<'quickReplies', QuickReplyInput, Partial<QuickReplyInput>>({
  table: 'quickReplies',
  label: 'Quick reply',
  idPrefix: 'qr',
  nameOf: (row) => row.shortcut,
  build(ctx, input) {
    return {
      shortcut: shortcutOf(requireText(input.shortcut, 'shortcut', 'Shortcut')),
      body: requireText(input.body, 'body', 'Reply'),
      channel: input.channel ?? null,
      createdBy: ctx.actor.id,
      createdAt: ctx.timestamp,
      updatedAt: ctx.timestamp,
    }
  },
  apply(ctx, row, patch) {
    return {
      ...row,
      ...(patch.shortcut !== undefined && {
        shortcut: shortcutOf(requireText(patch.shortcut, 'shortcut', 'Shortcut')),
      }),
      ...(patch.body !== undefined && { body: requireText(patch.body, 'body', 'Reply') }),
      ...(patch.channel !== undefined && { channel: patch.channel }),
      updatedAt: ctx.timestamp,
    }
  },
})
