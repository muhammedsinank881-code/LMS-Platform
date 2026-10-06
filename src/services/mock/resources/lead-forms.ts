import { addDays, format } from 'date-fns'
import type { LeadFormsApiClient } from '@/services/api/lead-forms'
import {
  leadFormSchema,
  type FormStatus,
  type FormSubmissionSummary,
  type LeadForm,
  type LeadFormInput,
} from '@/types'
import { request, type RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { requireSection } from '../core/section'
import { randomToken } from '../core/secrets'
import { parseInput, validationError } from '../core/validate'
import { ApiError } from '@/services/api/errors'
import { submitPublicForm, loadPublicForm } from './lead-forms-public'

const guard = (ctx: RequestContext) => requireSection(ctx, 'lead_capture')

function checkReferences(ctx: RequestContext, input: LeadFormInput): void {
  const { defaults } = input
  if (defaults.sourceId && !ctx.db.find('leadSources', defaults.sourceId)) throw validationError('defaults', 'Choose a valid source.')
  if (defaults.campaignId && !ctx.db.find('campaigns', defaults.campaignId)) throw validationError('defaults', 'Choose a valid campaign.')
  if (defaults.statusId && !ctx.db.find('leadStatuses', defaults.statusId)) throw validationError('defaults', 'Choose a valid status.')
  if (defaults.assignUserId && !ctx.db.find('users', defaults.assignUserId)) throw validationError('defaults', 'Choose a valid team member.')
  const custom = new Set(ctx.db.all('customFields').filter((field) => field.entity === 'lead' && !field.archived).map((field) => `custom.${field.key}`))
  for (const field of input.fields) {
    if (field.key.startsWith('custom.') && !custom.has(field.key)) throw validationError('fields', `"${field.label}" points at a custom field that no longer exists.`)
  }
  for (const id of input.notifyUserIds) if (!ctx.db.find('users', id)) throw validationError('notifyUserIds', 'Choose valid team members.')
}

const clean = (input: LeadFormInput) => ({ ...input, redirectUrl: input.redirectUrl?.trim() || null, consentText: input.consentText?.trim() || null })

function audit(ctx: RequestContext, form: LeadForm, action: 'created' | 'updated' | 'deleted', note: string): void {
  recordAudit(ctx, { action, entity: 'lead_form', entityId: form.id, entityLabel: form.name, newValue: { event: note, status: form.status, fields: form.fields.length } })
}

function summarize(ctx: RequestContext, formId: string): FormSubmissionSummary {
  const rows = ctx.db.all('formSubmissions').filter((row) => row.formId === formId && !row.spam)
  const today = new Date(ctx.now)
  const daily = Array.from({ length: 14 }, (_, index) => {
    const date = format(addDays(today, index - 13), 'yyyy-MM-dd')
    return { date, count: rows.filter((row) => row.at.slice(0, 10) === date).length }
  })
  const latest = [...rows].sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id)).slice(0, 10)
  return { total: rows.length, daily, latest }
}

export const mockLeadFormsApi: LeadFormsApiClient = {
  list: () =>
    request((ctx) => {
      guard(ctx)
      return [...ctx.db.all('leadForms')].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }),
  get: (id) => request((ctx) => (guard(ctx), ctx.db.get('leadForms', id, 'Form'))),
  create: (input) =>
    request((ctx) => {
      guard(ctx)
      const parsed = clean(parseInput(leadFormSchema, input) as LeadFormInput)
      checkReferences(ctx, parsed)
      const form = ctx.db.insert('leadForms', {
        ...parsed,
        id: `form-${randomToken(8).toLowerCase()}`,
        status: 'active',
        submissionCount: 0,
        createdBy: ctx.actor.id,
        createdAt: ctx.timestamp,
        updatedAt: ctx.timestamp,
      })
      audit(ctx, form, 'created', 'created')
      return form
    }),
  update: (id, input) =>
    request((ctx) => {
      guard(ctx)
      const current = ctx.db.get('leadForms', id, 'Form')
      if (current.status === 'archived') throw new ApiError('CONFLICT', 'Restore this form before editing it.')
      const parsed = clean(parseInput(leadFormSchema, input) as LeadFormInput)
      checkReferences(ctx, parsed)
      const saved = ctx.db.save('leadForms', { ...current, ...parsed, updatedAt: ctx.timestamp })
      audit(ctx, saved, 'updated', 'updated')
      return saved
    }),
  setStatus: (id, status: FormStatus) =>
    request((ctx) => {
      guard(ctx)
      const current = ctx.db.get('leadForms', id, 'Form')
      const saved = ctx.db.save('leadForms', { ...current, status, updatedAt: ctx.timestamp })
      audit(ctx, saved, 'updated', status)
      return saved
    }),
  duplicate: (id) =>
    request((ctx) => {
      guard(ctx)
      const source = ctx.db.get('leadForms', id, 'Form')
      const copy = ctx.db.insert('leadForms', {
        ...source,
        id: `form-${randomToken(8).toLowerCase()}`,
        name: `${source.name} (copy)`,
        status: 'disabled',
        submissionCount: 0,
        createdBy: ctx.actor.id,
        createdAt: ctx.timestamp,
        updatedAt: ctx.timestamp,
      })
      audit(ctx, copy, 'created', 'duplicated')
      return copy
    }),
  submissions: (id) =>
    request((ctx) => {
      guard(ctx)
      ctx.db.get('leadForms', id, 'Form')
      return summarize(ctx, id)
    }),
  getPublic: (id) => loadPublicForm(id),
  submitPublic: (id, input) => submitPublicForm(id, input),
}
