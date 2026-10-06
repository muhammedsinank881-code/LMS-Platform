import { describe, expect, it } from 'vitest'
import { makeLead } from '@/test/factories'
import type { AutomationAction, DomainEvent, LeafAction } from '@/types'
import type { AutomationContext } from './fields'
import { planActions } from './plan'
import { chainBlock, childChain, isRateLimited, MAX_CHAIN_DEPTH, shouldAutoDisable } from './safety'
import { summarizeAutomation } from './summary'
import { validateAutomation, type ValidationRefs } from './validate'

const ctx = (budget: number | null): AutomationContext => ({
  now: new Date('2026-09-10T10:00:00.000Z'),
  lead: makeLead({ budget }),
  deal: null,
  owner: null,
  source: null,
  campaign: null,
  teamOf: () => null,
  withinBusinessHours: true,
})

const note = (text: string): LeafAction => ({ type: 'add_note', text })

describe('planActions', () => {
  const actions: AutomationAction[] = [
    note('one'),
    {
      type: 'branch',
      conditions: { logic: 'and', items: [{ field: 'budget', operator: 'gt', value: 100 }] },
      then: [note('big')],
      else: [note('small')],
    },
    { type: 'wait', amount: 2, unit: 'hours' },
    note('after'),
  ]

  it('picks the branch side and stops at the first wait', () => {
    const plan = planActions({ actions }, ctx(500))
    expect(plan.items.map((i) => i.path)).toEqual(['0', '1', '1.then.0', '2'])
    expect(plan.stoppedAtWait).toBe(2)
    const small = planActions({ actions }, ctx(10))
    expect(small.items.map((i) => i.path)).toContain('1.else.0')
  })

  it('can plan through waits and resume from an index', () => {
    expect(planActions({ actions }, ctx(500), { throughWaits: true }).items.at(-1)?.path).toBe('3')
    const resumed = planActions({ actions }, ctx(500), { from: 3 })
    expect(resumed.items.map((i) => i.path)).toEqual(['3'])
    expect(resumed.stoppedAtWait).toBeNull()
  })

  it('computes wait durations', () => {
    const wait = planActions({ actions }, ctx(1)).items.find((i) => i.kind === 'wait')
    expect(wait).toMatchObject({ ms: 7_200_000 })
  })
})

describe('safety', () => {
  const event = (depth: number, causedBy: string[]): DomainEvent => ({
    id: 'e',
    tenantId: 't',
    type: 'lead_updated',
    entity: { kind: 'lead', id: 'L-1' },
    occurredAt: '',
    data: {},
    chain: { chainId: 'c', depth, causedBy },
  })

  it('blocks an automation from re-triggering itself and enforces max depth', () => {
    expect(chainBlock(event(1, ['a']), 'a')).toMatch(/loop/)
    expect(chainBlock(event(1, ['a']), 'b')).toBeNull()
    expect(chainBlock(event(MAX_CHAIN_DEPTH, []), 'a')).toBeNull()
    expect(chainBlock(event(MAX_CHAIN_DEPTH + 1, []), 'a')).toMatch(/depth/)
  })

  it('extends the chain', () => {
    expect(childChain({ chainId: 'c', depth: 1, causedBy: ['a'] }, 'b')).toEqual({
      chainId: 'c',
      depth: 2,
      causedBy: ['a', 'b'],
    })
  })

  it('rate limits per hour and auto-disables after repeated failures', () => {
    const now = new Date('2026-09-10T10:00:00.000Z')
    const recent = Array.from({ length: 5 }, () => ({ startedAt: '2026-09-10T09:30:00.000Z' }))
    expect(isRateLimited(recent, now)).toBe(true)
    expect(isRateLimited(recent.slice(0, 4), now)).toBe(false)
    expect(isRateLimited(recent.map(() => ({ startedAt: '2026-09-10T08:00:00.000Z' })), now)).toBe(false)
    expect(shouldAutoDisable(4)).toBe(false)
    expect(shouldAutoDisable(5)).toBe(true)
  })
})

const refs: ValidationRefs = {
  users: new Set(['u1']),
  teams: new Set(['t1']),
  templates: new Set(['tpl1']),
  statuses: new Set(['s1']),
  sources: new Set(['src1']),
  pipelines: new Set(['p1']),
  stages: new Set(['st1']),
  customFieldKeys: ['plan'],
}

const base = {
  name: 'Test',
  description: '',
  trigger: { type: 'lead_created' as const, sourceIds: [] },
  conditions: { logic: 'and' as const, items: [] },
}

describe('validateAutomation', () => {
  it('accepts a complete automation', () => {
    expect(validateAutomation({ ...base, actions: [{ type: 'send_whatsapp', templateId: 'tpl1' }] }, refs)).toEqual([])
  })

  it('flags missing config and deleted references', () => {
    const issues = validateAutomation(
      {
        ...base,
        name: ' ',
        actions: [
          { type: 'send_whatsapp', templateId: 'gone' },
          { type: 'assign', strategy: 'specific_user', userId: 'ghost', teamId: null },
          { type: 'change_status', statusId: '' },
          { type: 'add_tags', tags: [] },
        ],
      },
      refs,
    )
    const byPath = Object.fromEntries(issues.map((i) => [i.path, i.message]))
    expect(byPath.name).toBeDefined()
    expect(byPath['actions.0']).toMatch(/no longer exists/)
    expect(byPath['actions.1']).toMatch(/no longer exists/)
    expect(byPath['actions.2']).toMatch(/Choose a status/)
    expect(byPath['actions.3']).toMatch(/at least one tag/)
  })

  it('flags unknown condition fields, empty values and permission gaps', () => {
    const issues = validateAutomation(
      {
        ...base,
        conditions: {
          logic: 'and',
          items: [
            { field: 'bogus', operator: 'equals', value: 1 },
            { field: 'budget', operator: 'gt', value: '' },
          ],
        },
        actions: [{ type: 'create_customer' }],
      },
      { ...refs, allowedActions: new Set() },
    )
    expect(issues.map((i) => i.path)).toEqual(
      expect.arrayContaining(['conditions.0', 'conditions.1', 'actions.0']),
    )
  })

  it('warns about unreachable steps', () => {
    const issues = validateAutomation(
      {
        ...base,
        actions: [
          { type: 'branch', conditions: { logic: 'and', items: [] }, then: [note('a')], else: [note('b')] },
          { type: 'wait', amount: 1, unit: 'hours' },
        ],
      },
      refs,
    )
    expect(issues.filter((i) => i.severity === 'warning')).toHaveLength(2)
  })
})

describe('summarizeAutomation', () => {
  it('writes one plain-language sentence', () => {
    const text = summarizeAutomation({
      trigger: { type: 'lead_created', sourceIds: ['fb'] },
      conditions: { logic: 'and', items: [{ field: 'productInterest', operator: 'equals', value: 'Website' }] },
      actions: [
        { type: 'assign', strategy: 'round_robin', userId: null, teamId: null },
        { type: 'create_followup', followUpType: 'call', dueInHours: 1, priority: 'high' },
        { type: 'notify_team', target: 'manager', teamId: null, message: 'x' },
      ],
    })
    expect(text).toBe(
      'When a new lead comes from fb, if Product interest is Website, assign round-robin, create a call follow-up in 1 hour, and notify the manager.',
    )
  })
})
