import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ApiError } from '@/services/api/errors'
import type { PerformanceQuery } from '@/types'
import { USERS, actAs, setupMock, tables, teardownMock } from './helpers'

const query: PerformanceQuery = {
  range: { from: '2026-06-01T00:00:00.000Z', to: '2026-10-05T18:29:59.999Z' },
}
const MONTH = '2026-10'

beforeEach(setupMock)
afterEach(teardownMock)

const codeOf = async (promise: Promise<unknown>) =>
  promise.then(
    () => null,
    (error: unknown) => (error instanceof ApiError ? error.code : 'OTHER'),
  )

const nameOf = (id: string) => tables().users.find((u) => u.id === id)?.name ?? ''

describe('team performance table', () => {
  it('shows every rep to a manager, with a totals row that matches the rows', async () => {
    actAs(USERS.neha)
    const { rows, totals } = await api.performance.team(query)
    expect(rows.length).toBeGreaterThanOrEqual(4)
    expect(totals.won).toBe(rows.reduce((t, r) => t + r.won, 0))
    expect(totals.revenue).toBe(rows.reduce((t, r) => t + r.revenue, 0))
    expect(totals.leadsAssigned).toBe(rows.reduce((t, r) => t + r.leadsAssigned, 0))
    expect(totals.activity.calls).toBe(rows.reduce((t, r) => t + r.activity.calls, 0))
    expect(rows.some((r) => r.activity.calls + r.activity.messages + r.activity.notes > 0)).toBe(true)
    expect(rows.every((r) => r.trend.length > 0)).toBe(true)
  })

  it('limits a team leader to their own team and refuses a salesperson', async () => {
    actAs(USERS.neha)
    const all = await api.performance.team(query)
    actAs(USERS.rahul)
    const team = await api.performance.team(query)
    expect(team.rows.length).toBeGreaterThan(0)
    expect(team.rows.length).toBeLessThan(all.rows.length)
    expect(team.rows.every((r) => r.teamId === 'team-north' || r.teamId === tables().users.find((u) => u.id === USERS.rahul)?.teamId)).toBe(true)
    actAs(USERS.ananya)
    expect(await codeOf(api.performance.team(query))).toBe('FORBIDDEN')
  })
})

describe('salesperson data scope', () => {
  it('can open their own rep view with only the team average for comparison', async () => {
    actAs(USERS.ananya)
    const detail = await api.performance.repDetail(USERS.ananya, query)
    expect(detail.isSelf).toBe(true)
    expect(detail.kpis.leadsAssigned).toBeGreaterThan(0)
    expect(detail.teamAverage.leadsAssigned).toBeGreaterThan(0)
    expect(detail.funnel.length).toBeGreaterThan(0)
    expect(detail.leadAging.reduce((t, b) => t + b.count, 0)).toBeGreaterThan(0)
  })

  it('cannot open another rep, and never receives their name', async () => {
    actAs(USERS.ananya)
    expect(await codeOf(api.performance.repDetail(USERS.vikram, query))).toBe('FORBIDDEN')
    expect(await codeOf(api.performance.repDetail(USERS.sneha, query))).toBe('FORBIDDEN')

    const detail = JSON.stringify(await api.performance.repDetail(USERS.ananya, query))
    const board = await api.performance.leaderboard(query, 'revenue')
    const everything = detail + JSON.stringify(board)
    for (const peer of [USERS.vikram, USERS.sneha, USERS.rahul, USERS.karan]) {
      expect(everything).not.toContain(nameOf(peer))
      expect(everything).not.toContain(peer)
    }
    expect(board.every((entry) => entry.userId === USERS.ananya && entry.isSelf)).toBe(true)
  })

  it('lets a team leader open a rep on their team but not another team', async () => {
    actAs(USERS.rahul)
    const own = await api.performance.repDetail(USERS.vikram, query)
    expect(own.name).toBe(nameOf(USERS.vikram))
    expect(await codeOf(api.performance.repDetail(USERS.sneha, query))).toBe('FORBIDDEN')
  })

  it('ranks the leaderboard for managers by each metric', async () => {
    actAs(USERS.neha)
    const revenue = await api.performance.leaderboard(query, 'revenue')
    expect(revenue.map((e) => e.rank)).toEqual(revenue.map((_, i) => i + 1))
    expect([...revenue].sort((a, b) => b.value - a.value).map((e) => e.userId)).toEqual(revenue.map((e) => e.userId))
    expect(revenue.every((e) => e.name !== null)).toBe(true)
    const speed = await api.performance.leaderboard(query, 'speed')
    expect([...speed].sort((a, b) => a.value - b.value).map((e) => e.userId)).toEqual(speed.map((e) => e.userId))
  })
})

describe('targets', () => {
  it('shows seeded targets as progress with a pace', async () => {
    actAs(USERS.neha)
    const progress = await api.performance.targetProgress(MONTH)
    expect(progress.some((p) => p.userId === null && p.name === 'Team')).toBe(true)
    const [first] = progress
    expect(first?.rows.map((r) => r.metric)).toEqual(['revenue', 'dealsWon', 'leadsContacted'])
    expect(first?.rows.every((r) => r.pace !== null)).toBe(true)
  })

  it('needs manage-targets to change them, and audit-logs the change', async () => {
    actAs(USERS.rahul)
    const input = { userId: USERS.vikram, month: MONTH, revenue: 500_000, dealsWon: 4, leadsContacted: 30 }
    expect(await codeOf(api.performance.saveTarget(input))).toBe('FORBIDDEN')
    actAs(USERS.neha)
    expect(await codeOf(api.performance.saveTarget({ ...input, month: 'bad' }))).toBe('VALIDATION')
    expect(await codeOf(api.performance.saveTarget({ ...input, revenue: -1 }))).toBe('VALIDATION')
    const saved = await api.performance.saveTarget(input)
    const again = await api.performance.saveTarget({ ...input, dealsWon: 9 })
    expect(again.id).toBe(saved.id)
    const list = await api.performance.listTargets(MONTH)
    expect(list.filter((t) => t.userId === USERS.vikram)).toHaveLength(1)
    expect(tables().auditLogs.filter((l) => l.entity === 'target').length).toBeGreaterThanOrEqual(2)
  })

  it('shows a salesperson only their own target', async () => {
    actAs(USERS.ananya)
    const targets = await api.performance.listTargets(MONTH)
    expect(targets.length).toBeGreaterThan(0)
    expect(targets.every((t) => t.userId === USERS.ananya)).toBe(true)
    expect(await codeOf(api.performance.saveTarget({ userId: USERS.ananya, month: MONTH, revenue: 1, dealsWon: 1, leadsContacted: 1 }))).toBe('FORBIDDEN')
  })
})
