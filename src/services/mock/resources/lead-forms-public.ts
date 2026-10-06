import { validateSubmission } from '@/lib/lead-forms/validate'
import { ApiError } from '@/services/api/errors'
import type { LeadForm, PublicLeadForm, PublicSubmitInput, PublicSubmitResult } from '@/types'
import { simulateNetwork } from '../latency'
import { getMockNow } from '../config'
import { notify, recordAudit } from '../core/records'
import { getMockState } from '../core/state'
import { publicWorkspaceContext } from '../core/system-actor'
import type { MockState } from '../core/store'
import { clone, newId } from '../core/util'
import { emit } from '../automation/event-bus'
import { ingestLead } from '../ingest/ingest-lead'

const WINDOW_MS = 30_000
const MAX_PER_WINDOW = 3
const MAX_VALUE_LENGTH = 1000

/** Recent submission times per form, held per database so a reset clears them. */
const recent = new WeakMap<MockState, Map<string, number[]>>()

export function checkRateLimit(formId: string, nowMs: number): void {
  const state = getMockState()
  const byForm = recent.get(state) ?? new Map<string, number[]>()
  recent.set(state, byForm)
  const times = (byForm.get(formId) ?? []).filter((time) => nowMs - time < WINDOW_MS)
  if (times.length >= MAX_PER_WINDOW) {
    throw new ApiError('CONFLICT', 'You are submitting too quickly. Please wait a moment and try again.')
  }
  byForm.set(formId, [...times, nowMs])
}

/** Looks a form up across workspaces, as a public URL must. Only active forms are served. */
function findActiveForm(formId: string): LeadForm {
  const form = getMockState().tables.leadForms.find((row) => row.id === formId)
  if (!form || form.status !== 'active') throw new ApiError('NOT_FOUND', 'This form is not available.')
  return form
}

/** The only fields the public page ever receives: no workspace, owner, routing or notify data. */
export function toPublicForm(form: LeadForm): PublicLeadForm {
  return {
    id: form.id,
    name: form.name,
    fields: form.fields,
    submitLabel: form.submitLabel,
    successMessage: form.successMessage,
    redirectUrl: form.redirectUrl,
    consentText: form.consentText,
    spamProtection: form.spamProtection,
    style: form.style,
  }
}

export async function loadPublicForm(formId: string): Promise<PublicLeadForm> {
  await simulateNetwork()
  return clone(toPublicForm(findActiveForm(formId)))
}

export async function submitPublicForm(formId: string, input: PublicSubmitInput): Promise<PublicSubmitResult> {
  await simulateNetwork()
  const form = findActiveForm(formId)
  const now = getMockNow()
  checkRateLimit(formId, now.getTime())

  const ctx = publicWorkspaceContext(form.tenantId, `Form: ${form.name}`)
  const result: PublicSubmitResult = { ok: true, redirectUrl: form.redirectUrl, successMessage: form.successMessage }

  if (form.spamProtection && input.honeypot?.trim()) {
    // Bots get the same success screen, and nothing is created.
    ctx.db.insert('formSubmissions', { id: newId('sub'), formId, leadId: null, at: ctx.timestamp, utm: {}, duplicate: false, spam: true })
    return result
  }

  const errors = validateSubmission(form, input.values, input.consent ?? false)
  const first = Object.values(errors)[0]
  if (first) throw new ApiError('VALIDATION', first, Object.fromEntries(Object.entries(errors).map(([key, message]) => [key, [message]])))

  const values = Object.fromEntries(
    form.fields.map((field) => [field.key, (input.values[field.key] ?? '').slice(0, MAX_VALUE_LENGTH)]),
  )
  const ingested = ingestLead(ctx, { shape: 'form', values }, { provider: 'form', captureFormId: form.id, defaults: form.defaults, utm: input.utm })

  ctx.db.insert('formSubmissions', {
    id: newId('sub'),
    formId,
    leadId: ingested.leadId,
    at: ctx.timestamp,
    utm: input.utm ?? {},
    duplicate: ingested.duplicates.length > 0,
    spam: false,
  })
  ctx.db.save('leadForms', { ...form, submissionCount: form.submissionCount + 1 })
  const lead = ctx.db.get('leads', ingested.leadId)
  for (const userId of form.notifyUserIds) {
    notify(ctx, userId, { type: 'form_submission', title: `New submission: ${form.name}`, body: `${lead.name} submitted the form.`, link: `/leads/${lead.id}` }, { includeActor: true })
  }
  recordAudit(ctx, { action: 'created', entity: 'lead_form', entityId: form.id, entityLabel: form.name, newValue: { event: 'submission', lead: lead.id } })
  emit(ctx, { type: 'form_submitted', entity: { kind: 'lead', id: lead.id }, data: { formId: form.id } })
  return result
}
