import type { AutomationsApiClient } from '@/services/api/automations'
import { dryRun } from '../../automation/dry-run'
import { cancelRun, retryRun } from '../../automation/engine'
import { request } from '../../core/context'
import { applyListParams } from '../../core/list-engine'
import {
  createDraft,
  duplicate,
  listSpec,
  publish,
  remove,
  restoreVersion,
  saveDraft,
  setEnabled,
} from './crud'
import { listRuns, stats } from './runs'
import { listTemplates } from './templates'

export const mockAutomationsApi: AutomationsApiClient = {
  list: (params) =>
    request((ctx) => {
      ctx.require('automations', 'view')
      return applyListParams(ctx.db.all('automations'), params, listSpec(ctx), 'automations')
    }),
  get: (id) =>
    request((ctx) => {
      ctx.require('automations', 'view')
      return ctx.db.get('automations', id, 'Automation')
    }),
  create: (input) => request((ctx) => createDraft(ctx, input)),
  update: (id, patch) => request((ctx) => saveDraft(ctx, id, patch)),
  delete: (id) => request((ctx) => remove(ctx, id)),
  publish: (id, input) => request((ctx) => publish(ctx, id, input)),
  setEnabled: (id, enabled) => request((ctx) => setEnabled(ctx, id, enabled)),
  duplicate: (id) => request((ctx) => duplicate(ctx, id)),
  test: ({ content, entity }) =>
    request((ctx) => {
      ctx.require('automations', 'edit')
      return dryRun(ctx, content, entity)
    }),
  listRuns: (params) => request((ctx) => listRuns(ctx, params)),
  getRun: (id) =>
    request((ctx) => {
      ctx.require('automations', 'view')
      return ctx.db.get('automationRuns', id, 'Run')
    }),
  retryRun: (id) =>
    request((ctx) => {
      ctx.require('automations', 'edit')
      return retryRun(ctx, id)
    }),
  cancelRun: (id) =>
    request((ctx) => {
      ctx.require('automations', 'edit')
      return cancelRun(ctx, id)
    }),
  templates: () => request((ctx) => listTemplates(ctx)),
  versions: (id) =>
    request((ctx) => {
      ctx.require('automations', 'view')
      return ctx.db
        .all('automationVersions')
        .filter((v) => v.automationId === id)
        .sort((a, b) => b.version - a.version)
    }),
  restoreVersion: (id, version) => request((ctx) => restoreVersion(ctx, id, version)),
  stats: () => request((ctx) => stats(ctx)),
}
