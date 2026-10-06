import { buildAutomationTemplates, templateContent } from '@/lib/automation/templates'
import type {
  Automation,
  AutomationContent,
  AutomationRun,
  AutomationRunStep,
  AutomationVersion,
  RunStatus,
} from '@/types'
import type { SeedContext } from './context'
import { DAY, HOUR, int, pick, seedId, type SeedEnv } from './rng'

type Def = { slug: string; content: AutomationContent; enabled: boolean }

function definitions(env: SeedEnv): Def[] {
  const status = (slug: string) => seedId(env, 'status', slug)
  const templates = buildAutomationTemplates({
    facebookSourceId: seedId(env, 'source', 'facebook'),
    teamId: seedId(env, 'team', 'north'),
    newStatusId: status('new'),
    waWelcomeId: seedId(env, 'tpl', 'wa-welcome'),
    waFollowUpId: seedId(env, 'tpl', 'wa-followup'),
    emailWelcomeId: seedId(env, 'tpl', 'em-thanks'),
    negotiationStageId: seedId(env, 'stage', 'negotiation'),
    pipelineId: '',
  })
  const fromTemplate = (key: string): Def => {
    const template = templates.find((t) => t.key === key)!
    return { slug: template.key, content: templateContent(template), enabled: true }
  }
  return [
    fromTemplate('facebook-welcome'),
    fromTemplate('won-onboarding'),
    fromTemplate('no-contact-2h'),
    {
      slug: 'hot-lead-alert',
      enabled: false,
      content: {
        name: 'Hot lead alert',
        description: 'Let the owner know straight away when a lead scores 70 or more.',
        trigger: { type: 'score_crossed', threshold: 70, direction: 'up' },
        conditions: { logic: 'and', items: [] },
        actions: [
          { type: 'notify_user', userId: 'assignee', message: '{{lead.name}} just became a hot lead.' },
          { type: 'create_followup', followUpType: 'demo', dueInHours: 24, priority: 'urgent' },
        ],
      },
    },
    {
      slug: 'overdue-nudge',
      enabled: true,
      content: {
        name: 'Overdue follow-up nudge',
        description: 'Notify the manager when a follow-up goes overdue.',
        trigger: { type: 'followup_overdue' },
        conditions: { logic: 'and', items: [] },
        actions: [
          { type: 'notify_team', target: 'manager', teamId: null, message: 'A follow-up for {{lead.name}} is overdue.' },
        ],
      },
    },
  ]
}

const RUN_ERRORS = ['WhatsApp template could not be delivered.', 'The lead has no WhatsApp number.']

function seedSteps(content: AutomationContent, status: RunStatus, at: string): AutomationRunStep[] {
  return content.actions.map((action, index) => {
    const failedHere = status === 'failed' && index === content.actions.length - 1
    return {
      path: String(index),
      actionType: action.type,
      status: failedHere ? 'failed' : 'succeeded',
      result: failedHere ? 'Failed' : 'Done',
      error: failedHere ? RUN_ERRORS[0] : null,
      startedAt: at,
      finishedAt: at,
    }
  })
}

/** Automations with a short run history. Smaller workspaces get the first few. */
export function buildAutomations(
  env: SeedEnv,
  ctx: SeedContext,
  count: number,
): { automations: Automation[]; runs: AutomationRun[]; versions: AutomationVersion[] } {
  const now = env.now.getTime()
  const author = ctx.users.find((u) => u.role === 'admin')?.id ?? null
  const runs: AutomationRun[] = []
  const versions: AutomationVersion[] = []

  const automations = definitions(env)
    .slice(0, count)
    .map(({ slug, content, enabled }): Automation => {
      const id = seedId(env, 'auto', slug)
      const created = now - int(env, 30, 90) * DAY
      const runCount = enabled ? int(env, 24, 180) : int(env, 3, 12)
      const history = Math.min(runCount, 8)
      let latest: number | null = null
      let failures = 0
      for (let i = 0; i < history; i++) {
        const startedAt = now - int(env, HOUR, 10 * DAY)
        latest = latest === null ? startedAt : Math.max(latest, startedAt)
        const status = pick(env, ['succeeded', 'succeeded', 'succeeded', 'succeeded', 'skipped', 'failed'] as const)
        if (status === 'failed') failures += 1
        const iso = new Date(startedAt).toISOString()
        const leadId = pick(env, ctx.leads).id
        runs.push({
          id: seedId(env, 'run', `${slug}-${i + 1}`),
          tenantId: env.tenantId,
          automationId: id,
          automationName: content.name,
          automationVersion: 1,
          entity: { kind: 'lead', id: leadId },
          eventId: `seed-${slug}-${i + 1}`,
          idempotencyKey: `${id}:${leadId}:seed-${i + 1}`,
          chain: { chainId: `seed-${slug}-${i + 1}`, depth: 0, causedBy: [] },
          triggerType: content.trigger.type,
          triggerPayload: {},
          status,
          steps: status === 'skipped' ? [] : seedSteps(content, status, iso),
          conditionTrace: [],
          cursor: content.actions.length,
          resumeAt: null,
          error: status === 'failed' ? RUN_ERRORS[0] : status === 'skipped' ? 'Skipped: too many runs for this record in the last hour.' : null,
          startedAt: iso,
          finishedAt: iso,
        })
      }
      versions.push({
        id: seedId(env, 'autover', `${slug}-1`),
        tenantId: env.tenantId,
        automationId: id,
        version: 1,
        ...content,
        publishedAt: new Date(created).toISOString(),
        publishedBy: author,
      })
      return {
        id,
        tenantId: env.tenantId,
        ...content,
        status: 'published',
        enabled,
        version: 1,
        runCount,
        lastRunAt: latest === null ? null : new Date(latest).toISOString(),
        errorCount: failures,
        consecutiveFailures: 0,
        createdBy: author,
        createdAt: new Date(created).toISOString(),
        updatedAt: new Date(created + int(env, 1, 20) * DAY).toISOString(),
      }
    })
  return { automations, runs: runs.sort((a, b) => b.startedAt.localeCompare(a.startedAt)), versions }
}
