import { describe, expect, it } from 'vitest'
import { makeAssignmentRule, makeLead, makeUser } from '@/test/factories'
import { pickAssignee } from './assignment'

const NOW = new Date(2026, 9, 7, 10)

const users = [
  makeUser({ id: 'u-a', teamId: 'north', language: 'Hindi', location: 'Delhi', workload: 5 }),
  makeUser({ id: 'u-b', teamId: 'north', language: 'English', location: 'Mumbai', workload: 2 }),
  makeUser({ id: 'u-c', teamId: 'south', language: 'Tamil', location: 'Chennai', workload: 9 }),
  makeUser({ id: 'u-lead', role: 'team_leader', teamId: 'south', workload: 1 }),
  makeUser({ id: 'u-admin', role: 'admin', workload: 0 }),
  makeUser({ id: 'u-off', status: 'inactive', workload: 0 }),
]

const pick = (
  lead: Parameters<typeof pickAssignee>[0],
  rules: Parameters<typeof pickAssignee>[1],
  leads: Parameters<typeof pickAssignee>[3] = [],
) => pickAssignee(lead, rules, users, leads, NOW)

describe('pickAssignee', () => {
  it('returns no assignee when there are no matching rules', () => {
    expect(pick(makeLead(), [])).toEqual({
      userId: null,
      ruleId: null,
      reason: 'No assignment rule matched',
    })
  })

  it('round-robins to the user assigned longest ago, never-assigned first', () => {
    const rules = [
      makeAssignmentRule({
        pool: { teamId: 'north', userIds: [], matchLanguage: false, matchLocation: false },
      }),
    ]
    expect(pick(makeLead(), rules).userId).toBe('u-a')

    const leads = [
      makeLead({ id: 'L-10001', assignedTo: 'u-a', assignedAt: '2026-10-01T10:00:00Z' }),
      makeLead({ id: 'L-10002', assignedTo: 'u-b', assignedAt: '2026-10-02T10:00:00Z' }),
    ]
    expect(pick(makeLead(), rules, leads).userId).toBe('u-a')

    leads.push(makeLead({ id: 'L-10003', assignedTo: 'u-a', assignedAt: '2026-10-03T10:00:00Z' }))
    expect(pick(makeLead(), rules, leads).userId).toBe('u-b')
  })

  it('assigns by lowest workload', () => {
    const rules = [
      makeAssignmentRule({
        distribution: 'workload',
        pool: { teamId: null, userIds: [], matchLanguage: false, matchLocation: false },
      }),
    ]
    expect(pick(makeLead(), rules).userId).toBe('u-lead')
  })

  it('assigns to a specific user from the pool', () => {
    const rules = [
      makeAssignmentRule({
        distribution: 'specific_user',
        pool: { teamId: null, userIds: ['u-c'], matchLanguage: false, matchLocation: false },
      }),
    ]
    expect(pick(makeLead(), rules).userId).toBe('u-c')
  })

  it('only considers salespeople and team leaders unless the pool names users', () => {
    const rules = [makeAssignmentRule({ distribution: 'workload' })]
    expect(pick(makeLead(), rules).userId).not.toBe('u-admin')
    const explicit = [
      makeAssignmentRule({
        distribution: 'workload',
        pool: {
          teamId: null,
          userIds: ['u-admin', 'u-a'],
          matchLanguage: false,
          matchLocation: false,
        },
      }),
    ]
    expect(pick(makeLead(), explicit).userId).toBe('u-admin')
  })

  it('skips inactive users', () => {
    const rules = [
      makeAssignmentRule({
        pool: { teamId: null, userIds: ['u-off'], matchLanguage: false, matchLocation: false },
      }),
    ]
    expect(pick(makeLead(), rules).userId).toBeNull()
  })

  it.each([
    [
      'source',
      { sourceId: 'source-facebook' },
      { field: 'sourceId', operator: 'equals', value: 'source-facebook' },
    ],
    ['location', { location: 'Delhi' }, { field: 'location', operator: 'equals', value: 'Delhi' }],
    [
      'product',
      { productInterest: 'SEO' },
      { field: 'productInterest', operator: 'contains', value: 'seo' },
    ],
    ['language', { language: 'Hindi' }, { field: 'language', operator: 'equals', value: 'Hindi' }],
    ['score', { score: 85 }, { field: 'score', operator: 'gt', value: 70 }],
  ] as const)('routes by lead %s', (_name, leadFields, condition) => {
    const targeted = makeAssignmentRule({
      id: 'targeted',
      priority: 1,
      conditions: [condition],
      pool: { teamId: null, userIds: ['u-c'], matchLanguage: false, matchLocation: false },
    })
    const fallback = makeAssignmentRule({
      id: 'fallback',
      priority: 2,
      pool: { teamId: null, userIds: ['u-a'], matchLanguage: false, matchLocation: false },
    })
    expect(pick(makeLead(leadFields), [fallback, targeted])).toMatchObject({
      userId: 'u-c',
      ruleId: 'targeted',
    })
    expect(pick(makeLead(), [fallback, targeted])).toMatchObject({
      userId: 'u-a',
      ruleId: 'fallback',
    })
  })

  it('routes by the owner team via a team condition on the user pool', () => {
    const rules = [
      makeAssignmentRule({
        pool: { teamId: 'south', userIds: [], matchLanguage: false, matchLocation: false },
      }),
    ]
    expect(['u-c', 'u-lead']).toContain(pick(makeLead(), rules).userId)
  })

  it('matches user language and location when the rule asks for it', () => {
    const rules = [
      makeAssignmentRule({
        pool: { teamId: null, userIds: [], matchLanguage: true, matchLocation: false },
      }),
    ]
    expect(pick(makeLead({ language: 'Tamil' }), rules).userId).toBe('u-c')

    const byCity = [
      makeAssignmentRule({
        pool: { teamId: null, userIds: [], matchLanguage: false, matchLocation: true },
      }),
    ]
    expect(pick(makeLead({ location: 'Mumbai' }), byCity).userId).toBe('u-b')
  })

  it('falls through to the next rule when a pool is empty', () => {
    const rules = [
      makeAssignmentRule({
        id: 'empty',
        priority: 1,
        pool: { teamId: 'nowhere', userIds: [], matchLanguage: false, matchLocation: false },
      }),
      makeAssignmentRule({ id: 'ok', priority: 2, distribution: 'workload' }),
    ]
    expect(pick(makeLead(), rules).ruleId).toBe('ok')
  })

  it('stops at a manual rule and leaves the lead unassigned', () => {
    const rules = [
      makeAssignmentRule({ id: 'manual', priority: 1, distribution: 'manual' }),
      makeAssignmentRule({ id: 'auto', priority: 2 }),
    ]
    expect(pick(makeLead(), rules)).toMatchObject({ userId: null, ruleId: 'manual' })
  })

  it('ignores inactive rules and respects priority order', () => {
    const rules = [
      makeAssignmentRule({
        id: 'off',
        priority: 1,
        isActive: false,
        pool: { teamId: null, userIds: ['u-c'], matchLanguage: false, matchLocation: false },
      }),
      makeAssignmentRule({
        id: 'second',
        priority: 3,
        pool: { teamId: null, userIds: ['u-b'], matchLanguage: false, matchLocation: false },
      }),
      makeAssignmentRule({
        id: 'first',
        priority: 2,
        pool: { teamId: null, userIds: ['u-a'], matchLanguage: false, matchLocation: false },
      }),
    ]
    expect(pick(makeLead(), rules).ruleId).toBe('first')
  })
})
