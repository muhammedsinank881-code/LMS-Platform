import { describe, expect, it } from 'vitest'
import {
  buildMonthGrid,
  buildWeekDays,
  dayKey,
  dueAtFromDayDrop,
  dueAtFromSlotDrop,
  slotIndex,
} from './calendar-grid'

describe('calendar grid', () => {
  it('starts weeks on Monday and fills whole weeks around the month', () => {
    const days = buildMonthGrid(new Date(2026, 9, 15))
    expect(days.length % 7).toBe(0)
    expect(days[0].getDay()).toBe(1)
    expect(days[0].getMonth()).not.toBe(9)
    expect(days.some((day) => day.getDate() === 1 && day.getMonth() === 9)).toBe(true)
    expect(days.at(-1)?.getDay()).toBe(0)
  })

  it('includes 29 February in a leap year', () => {
    const days = buildMonthGrid(new Date(2028, 1, 10))
    const leap = days.find((day) => dayKey(day) === '2028-02-29')
    expect(leap).toBeTruthy()
    expect(leap?.getDay()).toBe(2)
    expect(days[0].getDay()).toBe(1)
  })

  it('builds seven days for a week starting Monday', () => {
    const days = buildWeekDays(new Date(2026, 9, 4))
    expect(days).toHaveLength(7)
    expect(dayKey(days[0])).toBe('2026-09-28')
    expect(dayKey(days[6])).toBe('2026-10-04')
    expect(days.every((day, index) => index === 0 || day.getDay() === (days[0].getDay() + index) % 7)).toBe(
      true,
    )
  })

  it('maps times onto slots and drop targets', () => {
    expect(slotIndex(new Date(2026, 9, 4, 7, 59))).toBeNull()
    expect(slotIndex(new Date(2026, 9, 4, 8, 0))).toBe(0)
    expect(slotIndex(new Date(2026, 9, 4, 9, 15))).toBe(2)
    expect(slotIndex(new Date(2026, 9, 4, 20, 0))).toBeNull()

    const moved = dueAtFromDayDrop(new Date(2026, 9, 4, 17, 30), new Date(2026, 9, 6, 1))
    expect(moved.getDate()).toBe(6)
    expect(moved.getHours()).toBe(17)
    expect(moved.getMinutes()).toBe(30)

    const slotted = dueAtFromSlotDrop(new Date(2026, 9, 6, 12), 3)
    expect(slotted.getHours()).toBe(9)
    expect(slotted.getMinutes()).toBe(30)
  })
})
