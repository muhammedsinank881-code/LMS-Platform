import {
  calculateLeadScore,
  DEFAULT_SCORING_THRESHOLDS,
  ruleMatches,
  scoreDistribution,
} from '@/lib/scoring'
import { ApiError } from '@/services/api/errors'
import type { RecalculationJob, ScoringApiClient } from '@/services/api/settings'
import {
  DEFAULT_SCORE_DECAY,
  ENGAGEMENT_SIGNALS,
  LEAD_FILTER_FIELDS,
  type FilterCondition,
  type Lead,
  type ScoreCategory,
  type ScoreDecay,
  type ScoringThresholds,
} from '@/types'
import type { RequestContext } from '../core/context'
import { request } from '../core/context'
import { notify, recordActivity, recordAudit } from '../core/records'
import type { TenantSettings } from '../core/store'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import { emit } from '../automation/event-bus'

const KNOWN_FIELDS: readonly string[] = LEAD_FILTER_FIELDS
const SIGNAL_FIELDS = ENGAGEMENT_SIGNALS.map((s) => `engagement.${s}`)

/** Scoring conditions may use lead fields, engagement counters and custom fields. */
export function assertRuleConditions(ctx: RequestContext, conditions: readonly FilterCondition[] | undefined): void {
  const customKeys = ctx.db.all('customFields').filter((f) => f.entity === 'lead').map((f) => `custom.${f.key}`)
  const bad = (conditions ?? []).find(
    (c) => !KNOWN_FIELDS.includes(c.field) && !SIGNAL_FIELDS.includes(c.field) && !customKeys.includes(c.field),
  )
  if (bad) throw validationError('conditions', `"${bad.field}" is not a field a rule can use.`)
}

export function assertRepeat(maxApplications: 'once' | number | undefined, repeatField: string | null | undefined): void {
  if (maxApplications === undefined || maxApplications === 'once') return
  if (!Number.isInteger(maxApplications) || maxApplications < 1 || maxApplications > 20) {
    throw validationError('maxApplications', 'A repeating rule can apply between 1 and 20 times.')
  }
  if (!repeatField || !SIGNAL_FIELDS.includes(repeatField)) {
    throw validationError('repeatField', 'Choose the engagement signal to count.')
  }
}

function settingsRow(ctx: RequestContext): TenantSettings {
  const row = ctx.db.find('tenantSettings', ctx.tenantId)
  if (!row) throw new ApiError('NOT_FOUND', 'Workspace settings not found.')
  return row
}

export function thresholdsOf(ctx: RequestContext): ScoringThresholds {
  return settingsRow(ctx).scoringThresholds ?? DEFAULT_SCORING_THRESHOLDS
}

export function decayOf(ctx: RequestContext): ScoreDecay {
  return settingsRow(ctx).scoringDecay ?? DEFAULT_SCORE_DECAY
}

function assertThresholds({ hot, warm }: ScoringThresholds): void {
  if (!(warm >= 0 && hot <= 100 && warm < hot)) {
    throw validationError('hot', 'Warm must be lower than hot, both between 0 and 100.')
  }
}

function assertDecay(decay: ScoreDecay): void {
  if (!Number.isInteger(decay.afterDays) || decay.afterDays < 1 || decay.afterDays > 365) {
    throw validationError('afterDays', 'Enter between 1 and 365 days.')
  }
  if (!Number.isInteger(decay.points) || decay.points < 1 || decay.points > 100) {
    throw validationError('points', 'Enter between 1 and 100 points.')
  }
}

const activeLeads = (ctx: RequestContext): Lead[] => ctx.db.all('leads').filter((l) => !l.archivedAt)

interface Job extends Omit<RecalculationJob, 'moves'> {
  queue: string[]
  moves: Map<string, number>
}

const jobs = new Map<string, Job>()
const BATCHES = 4

export function resetScoringJobs(): void {
  jobs.clear()
}

const view = (job: Job): RecalculationJob => ({
  id: job.id,
  status: job.status,
  total: job.total,
  processed: job.processed,
  scoreChanges: job.scoreChanges,
  categoryChanges: job.categoryChanges,
  moves: [...job.moves.entries()].map(([key, count]) => {
    const [from, to] = key.split('>') as [ScoreCategory, ScoreCategory]
    return { from, to, count }
  }),
  startedAt: job.startedAt,
  finishedAt: job.finishedAt,
})

function processBatch(ctx: RequestContext, job: Job): void {
  const settings = settingsRow(ctx)
  const rules = ctx.db.all('scoringRules')
  const size = Math.ceil(job.total / BATCHES) || 1
  for (const id of job.queue.splice(0, size)) {
    const lead = ctx.db.find('leads', id)
    job.processed += 1
    if (!lead) continue
    const result = calculateLeadScore(lead, rules, settings.scoringThresholds, ctx.now, { decay: settings.scoringDecay })
    if (result.score === lead.score && result.category === lead.scoreCategory) continue
    ctx.db.save('leads', { ...lead, score: result.score, scoreCategory: result.category, scoreBreakdown: result.breakdown })
    if (result.score !== lead.score) {
      job.scoreChanges += 1
      emit(ctx, { type: 'score_crossed', entity: { kind: 'lead', id }, data: { fromScore: lead.score, toScore: result.score } })
    }
    if (result.category !== lead.scoreCategory) {
      job.categoryChanges += 1
      const key = `${lead.scoreCategory}>${result.category}`
      job.moves.set(key, (job.moves.get(key) ?? 0) + 1)
      recordActivity(ctx, id as Lead['id'], { type: 'score_changed', data: { from: lead.score, to: result.score } }, { actorId: null })
    }
  }
  if (job.queue.length > 0) return
  job.status = 'completed'
  job.finishedAt = ctx.timestamp
  recordAudit(ctx, {
    action: 'settings_changed',
    entity: 'setting',
    entityId: 'scoring-recalculation',
    entityLabel: 'Recalculated all lead scores',
    newValue: { leads: job.total, scoreChanges: job.scoreChanges, categoryChanges: job.categoryChanges },
  })
  notify(
    ctx,
    ctx.actor.id,
    {
      type: 'import_finished',
      title: 'Lead scores recalculated',
      body: `${job.categoryChanges} of ${job.total} leads changed category.`,
      link: '/settings/scoring',
    },
    { includeActor: true },
  )
}

export const scoringExtras: Pick<
  ScoringApiClient,
  'getSettings' | 'updateSettings' | 'usage' | 'distribution' | 'testLead' | 'startRecalculation' | 'getRecalculation'
> = {
  getSettings: () => request((ctx) => ({ thresholds: thresholdsOf(ctx), decay: decayOf(ctx) })),
  updateSettings: (patch) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const row = settingsRow(ctx)
      const thresholds = patch.thresholds ?? thresholdsOf(ctx)
      const decay = patch.decay ?? decayOf(ctx)
      assertThresholds(thresholds)
      assertDecay(decay)
      ctx.db.save('tenantSettings', { ...row, scoringThresholds: thresholds, scoringDecay: decay })
      recordAudit(ctx, {
        action: 'settings_changed',
        entity: 'setting',
        entityId: 'scoring-settings',
        entityLabel: 'Scoring settings',
        previousValue: { hot: row.scoringThresholds.hot, warm: row.scoringThresholds.warm, decay: row.scoringDecay?.enabled ?? false },
        newValue: { hot: thresholds.hot, warm: thresholds.warm, decay: decay.enabled, decayAfterDays: decay.afterDays, decayPoints: decay.points },
      })
      return { thresholds, decay }
    }),
  usage: () =>
    request((ctx) => {
      const leads = activeLeads(ctx)
      return Object.fromEntries(
        ctx.db.all('scoringRules').map((rule) => [rule.id, leads.filter((l) => ruleMatches(rule, l, ctx.now)).length]),
      )
    }),
  distribution: (thresholds) =>
    request((ctx) => {
      assertThresholds(thresholds)
      return scoreDistribution(activeLeads(ctx), thresholds)
    }),
  testLead: (leadId) =>
    request((ctx) => {
      const lead = ctx.db.get('leads', leadId, 'Lead')
      return calculateLeadScore(lead, ctx.db.all('scoringRules'), thresholdsOf(ctx), ctx.now, { decay: decayOf(ctx) })
    }),
  startRecalculation: () =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const queue = activeLeads(ctx).map((l) => l.id)
      const job: Job = {
        id: newId('recalc'),
        status: 'running',
        total: queue.length,
        processed: 0,
        scoreChanges: 0,
        categoryChanges: 0,
        moves: new Map(),
        startedAt: ctx.timestamp,
        finishedAt: null,
        queue,
      }
      jobs.set(`${ctx.tenantId}:${job.id}`, job)
      if (queue.length === 0) processBatch(ctx, job)
      return view(job)
    }),
  getRecalculation: (id) =>
    request((ctx) => {
      const job = jobs.get(`${ctx.tenantId}:${id}`)
      if (!job) throw new ApiError('NOT_FOUND', 'Recalculation not found.')
      if (job.status === 'running') processBatch(ctx, job)
      return view(job)
    }),
}
