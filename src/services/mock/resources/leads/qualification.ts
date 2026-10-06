import type { SaveQualificationInput } from '@/services/api/leads'
import { QUALIFICATION_STATUSES, type Lead, type LeadId } from '@/types'
import type { RequestContext } from '../../core/context'
import { recordActivity } from '../../core/records'
import { validationError } from '../../core/validate'
import { requireLead } from './access'
import { saveWithRescore } from './changes'

const STATUS_LABEL: Record<SaveQualificationInput['qualificationStatus'], string> = {
  qualified: 'Qualified',
  not_qualified: 'Not qualified',
  needs_info: 'Needs more information',
}

/** Stores the answers, updates the status, and leaves a note on the timeline. */
export function saveQualification(
  ctx: RequestContext,
  id: LeadId,
  input: SaveQualificationInput,
): Lead {
  const lead = requireLead(ctx, id, 'edit')
  if (!QUALIFICATION_STATUSES.includes(input.qualificationStatus)) {
    throw validationError('qualificationStatus', 'Select a qualification status.')
  }
  const saved = saveWithRescore(
    ctx,
    {
      ...lead,
      qualificationStatus: input.qualificationStatus,
      qualificationAnswers: input.qualificationAnswers,
      updatedAt: ctx.timestamp,
    },
    lead,
  )
  const note = input.notes?.trim()
  const text = note
    ? `Qualification saved as ${STATUS_LABEL[input.qualificationStatus]}. ${note}`
    : `Qualification saved as ${STATUS_LABEL[input.qualificationStatus]}.`
  recordActivity(ctx, saved.id, { type: 'note', data: { text } })
  return saved
}
