import { ApiError } from '@/services/api/errors'
import type { UpdateNoteInput } from '@/services/api/leads'
import type { Activity, LeadId } from '@/types'
import type { RequestContext } from '../../core/context'
import { validationError } from '../../core/validate'
import { requireLead } from './access'

function requireOwnNote(ctx: RequestContext, leadId: LeadId, activityId: string): Activity {
  const lead = requireLead(ctx, leadId, 'edit')
  const activity = ctx.db.get('activities', activityId, 'Note')
  if (activity.leadId !== lead.id || activity.type !== 'note') {
    throw new ApiError('NOT_FOUND', 'Note not found.')
  }
  if (activity.actorId !== ctx.actor.id) {
    throw new ApiError('FORBIDDEN', 'Only the author can change this note.')
  }
  return activity
}

export function listPinnedNotes(ctx: RequestContext, id: LeadId): Activity[] {
  requireLead(ctx, id, 'view')
  return ctx.db
    .all('activities')
    .filter((activity) => activity.leadId === id && activity.type === 'note' && activity.data.pinned)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function updateNote(
  ctx: RequestContext,
  leadId: LeadId,
  activityId: string,
  input: UpdateNoteInput,
): Activity {
  const activity = requireOwnNote(ctx, leadId, activityId)
  const text = input.text.trim()
  if (!text) throw validationError('text', 'Write something first.')
  if (activity.type !== 'note') throw new ApiError('NOT_FOUND', 'Note not found.')
  return ctx.db.save('activities', {
    ...activity,
    data: { text, pinned: activity.data.pinned },
    updatedAt: ctx.timestamp,
  })
}

export function deleteNote(ctx: RequestContext, leadId: LeadId, activityId: string): void {
  const activity = requireOwnNote(ctx, leadId, activityId)
  ctx.db.remove('activities', activity.id)
}

export function setNotePinned(
  ctx: RequestContext,
  leadId: LeadId,
  activityId: string,
  pinned: boolean,
): Activity {
  const activity = requireOwnNote(ctx, leadId, activityId)
  if (activity.type !== 'note') throw new ApiError('NOT_FOUND', 'Note not found.')
  return ctx.db.save('activities', {
    ...activity,
    data: { ...activity.data, pinned },
  })
}
