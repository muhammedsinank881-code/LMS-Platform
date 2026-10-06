import { ApiError } from '@/services/api/errors'
import type { TemplatesApiClient } from '@/services/api/templates'
import { parseTemplateVariables, validateTemplateVariables } from '@/lib/inbox/template-variables'
import type { TemplateButton, TemplateInput, TemplatePatch } from '@/types'
import { createConfigApi, requireText } from '../core/config-crud'
import { request, type RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import { leadCustomKeys } from './conversation-effects'
import { tickInbox } from './conversations-access'

function conflict(message: string): never {
  throw new ApiError('CONFLICT', message)
}

function variablesOf(body: string, subject?: string | null, header?: string | null, footer?: string | null) {
  return parseTemplateVariables(`${subject ?? ''} ${header ?? ''} ${body} ${footer ?? ''}`)
}

function buttonsOf(value: TemplateButton[] | undefined): TemplateButton[] {
  const buttons = value ?? []
  if (buttons.length > 3) throw validationError('buttons', 'WhatsApp templates can have up to 3 buttons.')
  return buttons.map((button) => ({
    kind: button.kind,
    label: requireText(button.label, 'buttons', 'Button label'),
    url: button.url ?? null,
    phone: button.phone ?? null,
  }))
}

function assertVariables(
  ctx: RequestContext,
  body: string,
  subject?: string | null,
  header?: string | null,
  footer?: string | null,
) {
  const { unknown } = validateTemplateVariables(
    `${subject ?? ''} ${header ?? ''} ${body} ${footer ?? ''}`,
    leadCustomKeys(ctx),
  )
  if (unknown.length > 0) throw validationError('body', `Unknown variables: ${unknown.join(', ')}.`)
}

const base = createConfigApi<'templates', TemplateInput, TemplatePatch>({
  table: 'templates',
  label: 'Template',
  idPrefix: 'tpl',
  nameOf: (row) => row.name,
  build(ctx, input) {
    const body = requireText(input.body, 'body', 'Message')
    assertVariables(ctx, body, input.subject, input.header, input.footer)
    return {
      name: requireText(input.name, 'name', 'Name'),
      channel: input.channel,
      category: input.category,
      language: requireText(input.language, 'language', 'Language'),
      body,
      subject: input.subject ?? null,
      header: input.header ?? null,
      footer: input.footer ?? null,
      buttons: buttonsOf(input.buttons),
      variables: variablesOf(body, input.subject, input.header, input.footer),
      sampleValues: input.sampleValues ?? {},
      status: 'draft' as const,
      rejectionReason: null,
      createdBy: ctx.actor.id,
      createdAt: ctx.timestamp,
      updatedAt: ctx.timestamp,
    }
  },
  apply(ctx, row, patch) {
    if (row.status === 'approved') {
      throw validationError('status', 'Approved templates cannot be edited. Clone it instead.')
    }
    const body = patch.body === undefined ? row.body : requireText(patch.body, 'body', 'Message')
    const subject = patch.subject === undefined ? row.subject : patch.subject
    const header = patch.header === undefined ? row.header : patch.header
    const footer = patch.footer === undefined ? row.footer : patch.footer
    assertVariables(ctx, body, subject, header, footer)
    return {
      ...row,
      ...(patch.name !== undefined && { name: requireText(patch.name, 'name', 'Name') }),
      ...(patch.channel !== undefined && { channel: patch.channel }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.language !== undefined && { language: requireText(patch.language, 'language', 'Language') }),
      body,
      subject,
      header,
      footer,
      buttons: patch.buttons ? buttonsOf(patch.buttons) : row.buttons,
      variables: variablesOf(body, subject, header, footer),
      sampleValues: patch.sampleValues ?? row.sampleValues,
      status: row.status === 'rejected' ? 'draft' : row.status,
      rejectionReason: row.status === 'rejected' ? null : row.rejectionReason,
      updatedAt: ctx.timestamp,
    }
  },
  present(ctx, row) {
    tickInbox(ctx)
    const current = ctx.db.find('templates', row.id) ?? row
    return {
      ...current,
      usageCount: ctx.db.all('messages').filter((message) => message.templateId === row.id).length,
    }
  },
  guardDelete(ctx, row) {
    const users = ctx.db
      .all('automations')
      .filter((item) =>
        item.actions.some((action) => 'templateId' in action && action.templateId === row.id),
      )
    if (users.length > 0) conflict(`"${row.name}" is used by the automation "${users[0].name}".`)
  },
})

function audit(
  ctx: RequestContext,
  action: 'created' | 'status_changed',
  row: { id: string; name: string },
  previousValue: Record<string, string> | null,
  newValue: Record<string, string>,
) {
  recordAudit(ctx, {
    action,
    entity: 'setting',
    entityId: row.id,
    entityLabel: `Template: ${row.name}`,
    previousValue,
    newValue,
  })
}

export const mockTemplatesApi: TemplatesApiClient = {
  ...base,
  submitForApproval: (id) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const row = ctx.db.get('templates', id, 'Template')
      if (row.status === 'approved') throw validationError('status', 'This template is already approved.')
      if (row.status === 'pending') return row
      assertVariables(ctx, row.body, row.subject, row.header, row.footer)
      const saved = ctx.db.save('templates', {
        ...row,
        status: 'pending',
        rejectionReason: null,
        updatedAt: ctx.timestamp,
      })
      audit(ctx, 'status_changed', saved, { status: row.status }, { status: 'pending' })
      return saved
    }),
  clone: (id) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const row = ctx.db.get('templates', id, 'Template')
      const copy = ctx.db.insert('templates', {
        ...row,
        id: newId('tpl'),
        name: `${row.name} (copy)`,
        status: 'draft',
        rejectionReason: null,
        createdBy: ctx.actor.id,
        createdAt: ctx.timestamp,
        updatedAt: ctx.timestamp,
      })
      audit(ctx, 'created', copy, null, { clonedFrom: row.name })
      return copy
    }),
}
