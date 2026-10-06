import type { CallLogsApiClient } from '@/services/api/call-logs'
import type { CallLog, CallLogFilterField, Conversation } from '@/types'
import { ApiError } from '@/services/api/errors'
import { request, type RequestContext } from '../core/context'
import { applyListParams, propertyValue, type ListSpec } from '../core/list-engine'
import { recordActivity } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import { conversationInScope, requireConversation } from './conversations-access'
import { ensureConversation } from './conversation-incoming'

const FIELDS: readonly CallLogFilterField[] = [
  'leadId',
  'conversationId',
  'userId',
  'startedAt',
  'outcome',
]

function spec(ctx: RequestContext): ListSpec<CallLog, CallLogFilterField> {
  return {
    fields: FIELDS,
    value: propertyValue,
    searchable: (row) => [row.notes],
    defaultSort: [{ field: 'startedAt', direction: 'desc' }],
    now: ctx.now,
  }
}

function visibleCallLogs(ctx: RequestContext): CallLog[] {
  return ctx.db.all('callLogs').filter((row) => {
    if (row.conversationId) {
      const conversation = ctx.db.find('conversations', row.conversationId)
      return conversation ? conversationInScope(ctx, conversation) : false
    }
    if (row.leadId) {
      const lead = ctx.db.find('leads', row.leadId)
      return Boolean(lead && ctx.inScope('leads', lead.assignedTo, lead.createdBy))
    }
    return ctx.inScope('inbox', row.userId)
  })
}

function touchCallConversation(ctx: RequestContext, conversation: Conversation, notes: string): Conversation {
  return ctx.db.save('conversations', {
    ...conversation,
    lastMessageAt: ctx.timestamp,
    lastMessagePreview: notes.slice(0, 90) || 'Call logged',
  })
}

export const mockCallLogsApi: CallLogsApiClient = {
  list: (params) =>
    request((ctx) => {
      ctx.require('inbox', 'view')
      return applyListParams(visibleCallLogs(ctx), params, spec(ctx), 'call logs')
    }),
  create: (input) =>
    request((ctx) => {
      ctx.require('inbox', 'create')
      if (input.durationSecs < 0) throw validationError('durationSecs', 'Duration cannot be negative.')
      let conversation: Conversation | null = null
      if (input.conversationId) {
        conversation = requireConversation(ctx, input.conversationId, 'create')
      } else if (input.leadId) {
        const lead = ctx.db.get('leads', input.leadId, 'Lead')
        ctx.assertInScope('leads', lead.assignedTo, lead.createdBy)
        conversation = ensureConversation(ctx, 'call', lead, lead.phone, lead.email)
      }
      const row: CallLog = ctx.db.insert('callLogs', {
        id: newId('call'),
        leadId: input.leadId ?? conversation?.leadId ?? null,
        conversationId: conversation?.id ?? null,
        direction: input.direction,
        durationSecs: input.durationSecs,
        outcome: input.outcome,
        notes: input.notes?.trim() ?? '',
        recordingUrl: conversation ? `mock://recording/${conversation.id}` : null,
        userId: ctx.actor.id,
        startedAt: input.startedAt ?? ctx.timestamp,
      })
      if (conversation) touchCallConversation(ctx, conversation, row.notes)
      if (row.leadId) {
        const lead = ctx.db.find('leads', row.leadId)
        if (lead) {
          recordActivity(ctx, lead.id, {
            type: 'call',
            data: { durationSecs: row.durationSecs, outcome: row.outcome, notes: row.notes },
          })
          ctx.db.save('leads', {
            ...lead,
            lastContactedAt: ctx.timestamp,
            firstResponseTimeMins:
              lead.firstResponseTimeMins ??
              Math.max(1, Math.round((ctx.now.getTime() - Date.parse(lead.createdAt)) / 60_000)),
            updatedAt: ctx.timestamp,
          })
        }
      }
      return row
    }),
  updateNotes: (id, notes) =>
    request((ctx) => {
      ctx.require('inbox', 'edit')
      const row = ctx.db.get('callLogs', id, 'Call log')
      if (!visibleCallLogs(ctx).some((item) => item.id === row.id)) {
        throw new ApiError('FORBIDDEN', 'You can only edit notes on calls you can see.')
      }
      return ctx.db.save('callLogs', { ...row, notes: notes.trim() })
    }),
}
