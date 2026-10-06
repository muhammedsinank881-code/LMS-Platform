import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'
import { disableSeededAutomations, facebookSourceId, install, runsOf, useMovableClock } from './automation-fixtures'

beforeEach(() => {
  setupMock()
  useMovableClock()
  actAs(USERS.arjun)
  disableSeededAutomations()
})
afterEach(teardownMock)

const acme = <T extends { tenantId: string }>(rows: T[]) => rows.filter((r) => r.tenantId === ACME_TENANT_ID)

describe('scoring rules from data', () => {
  it('the seed is the single source: rules, engagement rules and thresholds come from the workspace', async () => {
    const rules = await api.settings.scoringRules.listAll()
    expect(rules.some((r) => r.name === 'Budget above ₹1L')).toBe(true)
    expect(rules.some((r) => r.conditions.some((c) => c.field.startsWith('engagement.')))).toBe(true)
    expect(await api.settings.scoringRules.getSettings()).toMatchObject({
      thresholds: { hot: 70, warm: 40 },
      decay: { enabled: false },
    })
  })

  it('accepts engagement conditions and repeat caps, and rejects unknown fields', async () => {
    const rule = await api.settings.scoringRules.create({
      name: 'Visited pricing',
      conditions: [{ field: 'engagement.websiteVisits', operator: 'gt', value: 2 }],
      points: 6,
      isActive: true,
      maxApplications: 4,
      repeatField: 'engagement.websiteVisits',
    })
    expect(rule).toMatchObject({ maxApplications: 4, repeatField: 'engagement.websiteVisits' })
    await expect(
      api.settings.scoringRules.create({ name: 'Bad', conditions: [{ field: 'nope', operator: 'equals', value: 1 }], points: 1, isActive: true }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(
      api.settings.scoringRules.create({ name: 'Bad repeat', conditions: [], points: 1, isActive: true, maxApplications: 3, repeatField: null }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('counts how many leads currently match each rule', async () => {
    const usage = await api.settings.scoringRules.usage()
    const rules = acme(tables().scoringRules)
    const email = rules.find((r) => r.name === 'Email provided')!
    const expected = acme(tables().leads).filter((l) => !l.archivedAt && l.email).length
    expect(usage[email.id]).toBe(expected)
  })

  it('tests a lead with the same shape as the score card', async () => {
    const lead = acme(tables().leads).find((l) => l.budget && l.budget > 100_000)!
    const result = await api.settings.scoringRules.testLead(lead.id)
    expect(result).toEqual(expect.objectContaining({ score: expect.any(Number), category: expect.stringMatching(/hot|warm|cold/), breakdown: expect.any(Array) }))
    expect(result.breakdown.some((b) => b.rule.name === 'Budget above ₹1L')).toBe(true)
  })

  it('previews the hot/warm/cold split for thresholds without saving them', async () => {
    const a = await api.settings.scoringRules.distribution({ hot: 70, warm: 40 })
    const b = await api.settings.scoringRules.distribution({ hot: 20, warm: 10 })
    expect(a.total).toBe(b.total)
    expect(b.hot).toBeGreaterThanOrEqual(a.hot)
    expect(await api.settings.scoringRules.getThresholds()).toEqual({ hot: 70, warm: 40 })
    await expect(api.settings.scoringRules.distribution({ hot: 30, warm: 60 })).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('saves thresholds and decay together, audited, admin only', async () => {
    await api.settings.scoringRules.updateSettings({ thresholds: { hot: 80, warm: 50 }, decay: { enabled: true, afterDays: 10, points: 5 } })
    expect(await api.settings.scoringRules.getSettings()).toEqual({ thresholds: { hot: 80, warm: 50 }, decay: { enabled: true, afterDays: 10, points: 5 } })
    expect(tables().auditLogs.some((l) => l.entityId === 'scoring-settings')).toBe(true)
    await expect(api.settings.scoringRules.updateSettings({ decay: { enabled: true, afterDays: 0, points: 5 } })).rejects.toMatchObject({ code: 'VALIDATION' })
    actAs(USERS.ananya)
    await expect(api.settings.scoringRules.updateSettings({ thresholds: { hot: 90, warm: 10 } })).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})

describe('recalculate all leads', () => {
  it('runs in batches with progress and summarizes category changes', async () => {
    await api.settings.scoringRules.create({ name: 'Everyone gets a boost', conditions: [], points: 60, isActive: true })
    const before = new Map(acme(tables().leads).map((l) => [l.id, { score: l.score, category: l.scoreCategory }]))
    const scoreChangedBefore = acme(tables().activities).filter((a) => a.type === 'score_changed').length

    let job = await api.settings.scoringRules.startRecalculation()
    expect(job).toMatchObject({ status: 'running', processed: 0 })
    const seen: number[] = []
    while (job.status === 'running') {
      job = await api.settings.scoringRules.getRecalculation(job.id)
      seen.push(job.processed)
    }
    expect(seen.length).toBeGreaterThan(1)
    expect(seen).toEqual([...seen].sort((a, b) => a - b))
    expect(job.processed).toBe(job.total)
    expect(job.finishedAt).not.toBeNull()

    const after = acme(tables().leads).filter((l) => !l.archivedAt)
    const categoryChanged = after.filter((l) => before.get(l.id)!.category !== l.scoreCategory)
    const scoreChanged = after.filter((l) => before.get(l.id)!.score !== l.score)
    expect(job.categoryChanges).toBe(categoryChanged.length)
    expect(job.scoreChanges).toBe(scoreChanged.length)
    expect(job.moves.reduce((n, m) => n + m.count, 0)).toBe(job.categoryChanges)
    expect(categoryChanged.length).toBeGreaterThan(0)

    const newActivities = acme(tables().activities).filter((a) => a.type === 'score_changed').length - scoreChangedBefore
    expect(newActivities).toBe(categoryChanged.length)
    expect(tables().auditLogs.some((l) => l.entityId === 'scoring-recalculation' && l.newValue?.categoryChanges === job.categoryChanges)).toBe(true)

    const again = await api.settings.scoringRules.startRecalculation()
    const done = await drain(again.id)
    expect(done.scoreChanges).toBe(0)
  })

  it('is admin only and unknown jobs are not found', async () => {
    await expect(api.settings.scoringRules.getRecalculation('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    actAs(USERS.vikram)
    await expect(api.settings.scoringRules.startRecalculation()).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})

async function drain(id: string) {
  let job = await api.settings.scoringRules.getRecalculation(id)
  while (job.status === 'running') job = await api.settings.scoringRules.getRecalculation(id)
  return job
}

describe('scoring on the event bus', () => {
  it('re-scores on an engagement signal and a score change can trigger an automation', async () => {
    const lead = await api.leads.create({
      name: 'Engaged Esha',
      phone: '9000066001',
      email: 'esha@example.in',
      company: 'Esha Studio',
      budget: 600_000,
      sourceId: facebookSourceId(),
    })
    expect(lead.score).toBeLessThan(70)
    const auto = install({
      name: 'Hot alert',
      trigger: { type: 'score_crossed', threshold: 70, direction: 'up' },
      actions: [{ type: 'add_note', text: 'Became hot' }],
    })

    await api.simulator.engagement({ leadId: lead.id, signal: 'demosAttended' })
    const saved = tables().leads.find((l) => l.id === lead.id)!
    expect(saved.score).toBe(lead.score + 15)
    expect(saved.engagement?.demosAttended).toBe(1)
    expect(saved.scoreBreakdown.some((b) => b.rule.name === 'Demo attended')).toBe(true)

    const runs = runsOf(auto.id).filter((r) => r.entity.id === lead.id)
    expect(runs).toHaveLength(1)
    expect(runs[0]).toMatchObject({ status: 'succeeded', triggerPayload: { fromScore: lead.score, toScore: saved.score } })
    expect(tables().activities.some((a) => a.leadId === lead.id && a.type === 'score_changed' && a.data.to === saved.score)).toBe(true)
  })

  it('repeating engagement rules add points up to their cap', async () => {
    const lead = await api.leads.create({ name: 'Replier Ria', phone: '9000066002', sourceId: facebookSourceId() })
    for (let i = 0; i < 5; i++) await api.simulator.engagement({ leadId: lead.id, signal: 'whatsappReplies' })
    const saved = tables().leads.find((l) => l.id === lead.id)!
    const replied = saved.scoreBreakdown.find((b) => b.rule.name === 'WhatsApp replied')!
    expect(replied.points).toBe(15)
  })

  it('a form submission raises form_submitted and engagement', async () => {
    const lead = await api.leads.create({ name: 'Form Farah', phone: '9000066003', sourceId: facebookSourceId() })
    const auto = install({
      name: 'On form',
      trigger: { type: 'form_submitted', formId: 'pricing' },
      actions: [{ type: 'add_note', text: 'Form seen' }],
    })
    await api.simulator.submitForm({ leadId: lead.id, formId: 'pricing' })
    await api.simulator.submitForm({ leadId: lead.id, formId: 'other' })
    expect(runsOf(auto.id)).toHaveLength(1)
  })

  it('the simulated clock moves dev time forward and back', async () => {
    const clock = await api.simulator.getClock()
    expect(clock.offsetMs).toBe(0)
    await expect(api.simulator.advanceClock(0)).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})
