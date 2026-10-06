import { describe, expect, it } from 'vitest'
import { makeFollowUp } from '@/test/factories'
import { collectReminders, reminderKey } from './reminders'

const due = new Date(2026, 9, 4, 17, 0, 0).toISOString()

describe('collectReminders', () => {
  it('raises a 15-minute reminder once, then stays quiet for the same due time', () => {
    const item = makeFollowUp({ id: 'fu-1', dueAt: due, reminderOffsetMinutes: 15, type: 'call' })
    const now = new Date(2026, 9, 4, 16, 50, 0)
    const first = collectReminders([item], now, new Set())
    expect(first.map((hit) => hit.kind)).toEqual(['due_soon'])
    const seen = new Set(first.map((hit) => hit.key))
    expect(collectReminders([item], now, seen)).toEqual([])
    expect(seen.has(reminderKey('due_soon', 'fu-1', due))).toBe(true)
  })

  it('does not repeat an overdue reminder after it has been seen', () => {
    const item = makeFollowUp({ id: 'fu-2', dueAt: due, reminderOffsetMinutes: 15, status: 'overdue' })
    const now = new Date(2026, 9, 4, 17, 5, 0)
    const key = reminderKey('overdue', 'fu-2', due)
    expect(collectReminders([item], now, new Set([key]))).toEqual([])
    const fresh = collectReminders([item], now, new Set())
    expect(fresh.some((hit) => hit.kind === 'overdue')).toBe(true)
  })

  it('skips completed follow-ups and follow-ups with no reminder until they are overdue', () => {
    const done = makeFollowUp({ id: 'done', dueAt: due, status: 'done', reminderOffsetMinutes: 15 })
    const silent = makeFollowUp({
      id: 'silent',
      dueAt: due,
      reminderOffsetMinutes: null,
      status: 'pending',
    })
    const before = new Date(2026, 9, 4, 16, 50, 0)
    expect(collectReminders([done, silent], before, new Set())).toEqual([])
    const after = new Date(2026, 9, 4, 17, 1, 0)
    expect(collectReminders([silent], after, new Set()).map((hit) => hit.kind)).toEqual(['overdue'])
  })
})
