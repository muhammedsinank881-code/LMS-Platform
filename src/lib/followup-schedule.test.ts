import { describe, expect, it } from 'vitest'
import { daysUntilNextMonday, quickPickDate } from './followup-schedule'

describe('quickPickDate', () => {
  const sunday = new Date(2026, 9, 4, 15, 30, 0)

  it('sets today at 5 PM even when that time has passed', () => {
    const picked = quickPickDate('today-5pm', new Date(2026, 9, 4, 18, 0, 0))
    expect(picked.getHours()).toBe(17)
    expect(picked.getDate()).toBe(4)
  })

  it('sets tomorrow at 11 AM', () => {
    const picked = quickPickDate('tomorrow-11am', sunday)
    expect(picked.getFullYear()).toBe(2026)
    expect(picked.getMonth()).toBe(9)
    expect(picked.getDate()).toBe(5)
    expect(picked.getHours()).toBe(11)
    expect(picked.getMinutes()).toBe(0)
  })

  it('sets three days ahead at 11 AM', () => {
    const picked = quickPickDate('in-3-days', sunday)
    expect(picked.getDate()).toBe(7)
    expect(picked.getHours()).toBe(11)
  })

  it('picks the coming Monday, and the one after when today is Monday', () => {
    const fromSunday = quickPickDate('next-monday', sunday)
    expect(fromSunday.getDate()).toBe(5)
    expect(fromSunday.getHours()).toBe(11)
    expect(daysUntilNextMonday(sunday)).toBe(1)

    const monday = new Date(2026, 9, 5, 9, 0, 0)
    const fromMonday = quickPickDate('next-monday', monday)
    expect(fromMonday.getDate()).toBe(12)
    expect(daysUntilNextMonday(monday)).toBe(7)
  })
})
