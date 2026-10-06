import { serializeCsv } from '@/lib/csv'
import type { AuditLogsApiClient } from '@/services/api/audit-logs'
import type { AuditLog, AuditLogFilterField } from '@/types'
import { request, type RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { applyListParams, filterRows, propertyValue, type ListSpec } from '../core/list-engine'

const FIELDS: readonly AuditLogFilterField[] = [
  'userId',
  'action',
  'entity',
  'entityId',
  'createdAt',
]

const spec = (ctx: RequestContext): ListSpec<AuditLog, AuditLogFilterField> => ({
  fields: FIELDS,
  value: propertyValue,
  searchable: (log) => [log.entityLabel, log.entityId, log.action, log.entity],
  // Same-instant entries keep the order they were written in, newest first.
  defaultSort: [{ field: 'createdAt', direction: 'desc' }],
  now: ctx.now,
})

export const mockAuditLogsApi: AuditLogsApiClient = {
  list: (params) =>
    request((ctx) => {
      ctx.require('audit_logs', 'view')
      return applyListParams(
        [...ctx.db.all('auditLogs')].reverse(),
        params,
        spec(ctx),
        'audit logs',
      )
    }),
  get: (id) =>
    request((ctx) => {
      ctx.require('audit_logs', 'view')
      return ctx.db.get('auditLogs', id, 'Audit log')
    }),
  export: (params) =>
    request((ctx) => {
      ctx.require('audit_logs', 'export')
      const rows = filterRows([...ctx.db.all('auditLogs')].reverse(), params, spec(ctx), 'audit logs')
      const csv = serializeCsv(
        ['When', 'User', 'Action', 'Entity', 'Record', 'Summary'],
        rows.map((log) => [
          log.createdAt,
          log.userId,
          log.action,
          log.entity,
          log.entityLabel,
          JSON.stringify(log.newValue ?? {}),
        ]),
      )
      recordAudit(ctx, {
        action: 'exported',
        entity: 'setting',
        entityId: 'audit-logs',
        entityLabel: 'Audit log export',
        newValue: { rows: rows.length },
      })
      return { filename: 'audit-logs.csv', csv }
    }),
}
