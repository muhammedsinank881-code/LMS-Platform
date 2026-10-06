import type { Activity, ActivityPayload, FollowUp, Lead } from '@/types'
import type { SeedContext } from './context'
import { CALL_NOTES, EMAIL_SCRIPTS, WHATSAPP_SCRIPTS } from './indian-chat'
import { fillTemplate } from './indian-data'
import { HOUR, MINUTE, int, pick, sample, scaled, seedId, type SeedEnv } from './rng'

/** The sales journey a showcase lead walks through, in order. */
const JOURNEY = [
  'new',
  'contacted',
  'interested',
  'qualified',
  'demo',
  'proposal',
  'negotiation',
  'won',
]
const SHOWCASE_SLUGS = new Set(['qualified', 'demo', 'proposal', 'negotiation', 'won', 'lost'])

type PayloadMaker = (lead: Lead, env: SeedEnv) => ActivityPayload[]

const vars = (lead: Lead) => ({
  name: lead.name.split(' ')[0],
  product: lead.productInterest ?? 'our service',
  city: lead.location ?? 'your city',
})

/** Interactions that naturally happen once a lead reaches a given status. */
const AFTER_STATUS: Record<string, PayloadMaker> = {
  contacted: (_lead, env) => [
    {
      type: 'call',
      data: { durationSecs: int(env, 40, 420), outcome: 'connected', notes: pick(env, CALL_NOTES) },
    },
  ],
  interested: (lead, env) => {
    const script = pick(env, WHATSAPP_SCRIPTS).map(([dir, text]) => ({
      dir,
      body: fillTemplate(text, vars(lead)),
    }))
    const out = script.find((line) => line.dir === 'out')
    const reply = script.find((line) => line.dir === 'in')
    return [
      ...(out ? [{ type: 'whatsapp_sent' as const, data: { body: out.body } }] : []),
      ...(reply ? [{ type: 'whatsapp_received' as const, data: { body: reply.body } }] : []),
    ]
  },
  qualified: (lead, env) => {
    const mail = pick(env, EMAIL_SCRIPTS).find(([dir]) => dir === 'out')
    return mail
      ? [
          {
            type: 'email_sent',
            data: {
              subject: fillTemplate(mail[1], vars(lead)),
              body: fillTemplate(mail[2], vars(lead)),
            },
          },
        ]
      : []
  },
  demo: (lead, env) => [
    {
      type: 'demo',
      data: {
        title: `${vars(lead).product} demo`,
        startsAt: new Date(Date.parse(lead.updatedAt) - int(env, 1, 3) * HOUR).toISOString(),
        notes: 'Walked through the dashboard and reporting.',
      },
    },
  ],
  proposal: (lead) => [
    {
      type: 'quotation_sent',
      data: { amount: lead.budget ?? 100_000, reference: `QT-${lead.id.slice(2)}` },
    },
  ],
  negotiation: (_lead, env) => [{ type: 'note', data: { text: pick(env, CALL_NOTES) } }],
}

function journeyFor(slug: string): string[] {
  if (slug === 'lost') return [...JOURNEY.slice(0, JOURNEY.indexOf('proposal') + 1), 'lost']
  return JOURNEY.slice(0, JOURNEY.indexOf(slug) + 1)
}

/** One `lead_created` per lead, plus a full timeline for a handful of showcase leads. */
export function buildActivities(
  env: SeedEnv,
  ctx: SeedContext,
  followUps: readonly FollowUp[],
): Activity[] {
  const { leads, config } = ctx
  const now = env.now.getTime()
  const statusId = (slug: string) => seedId(env, 'status', slug)
  const slugOf = new Map([...JOURNEY, 'lost'].map((slug) => [statusId(slug), slug]))
  const staged: Array<{
    at: number
    leadId: Lead['id']
    actorId: string | null
    payload: ActivityPayload
  }> = []

  for (const lead of leads) {
    staged.push({
      at: Date.parse(lead.createdAt),
      leadId: lead.id,
      actorId: lead.createdBy,
      payload: { type: 'lead_created', data: { sourceId: lead.sourceId } },
    })
  }

  const showcase = sample(
    env,
    leads.filter(
      (l) =>
        !l.archivedAt && l.assignedTo !== null && SHOWCASE_SLUGS.has(slugOf.get(l.statusId) ?? ''),
    ),
    scaled(env, 9, 3),
  )

  for (const lead of showcase) {
    const slug = slugOf.get(lead.statusId) ?? 'new'
    const owner = lead.assignedTo
    const path = journeyFor(slug)
    const payloads: ActivityPayload[] = [
      {
        type: 'assigned',
        data: { toUserId: owner ?? '', ruleId: config.assignmentRules[0]?.id ?? null },
      },
    ]
    path.forEach((step, index) => {
      if (index > 0) {
        payloads.push({
          type: 'status_changed',
          data: {
            fromStatusId: statusId(path[index - 1]),
            toStatusId: statusId(step),
            lostReasonId: step === 'lost' ? (lead.lostReasonId ?? null) : null,
          },
        })
      }
      payloads.push(...(AFTER_STATUS[step]?.(lead, env) ?? []))
    })
    payloads.push({
      type: 'score_changed',
      data: { from: Math.max(0, lead.score - int(env, 8, 20)), to: lead.score },
    })
    for (const f of followUps.filter((x) => x.leadId === lead.id)) {
      payloads.push({
        type: 'followup_scheduled',
        data: { followUpId: f.id, kind: f.type, dueAt: f.dueAt },
      })
      if (f.status === 'done') {
        payloads.push({
          type: 'followup_completed',
          data: { followUpId: f.id, kind: f.type, note: f.completionNote ?? '' },
        })
      }
    }

    const start = Date.parse(lead.assignedAt ?? lead.createdAt) + 5 * MINUTE
    const end = Math.max(start + HOUR, Math.min(now, Date.parse(lead.updatedAt)))
    payloads.forEach((payload, index) => {
      const slot = (end - start) / (payloads.length + 1)
      staged.push({
        at: Math.min(
          now,
          Math.round(start + slot * (index + 1) + int(env, -5 * MINUTE, 5 * MINUTE)),
        ),
        leadId: lead.id,
        actorId: payload.type === 'score_changed' ? null : owner,
        payload,
      })
    })
  }

  return staged
    .sort((a, b) => a.at - b.at)
    .map(({ at, leadId, actorId, payload }, index): Activity => ({
      id: seedId(env, 'activity', index + 1),
      tenantId: env.tenantId,
      leadId,
      dealId: null,
      actorId,
      createdAt: new Date(at).toISOString(),
      ...payload,
    }))
}
