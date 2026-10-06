import type { AutomationTrigger } from '@/types'

type ScheduledTrigger = Extract<AutomationTrigger, { type: 'scheduled' }>

export function parseClock(time: string): [number, number] {
  const [h, m] = time.split(':').map(Number)
  return [Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0]
}

/** The most recent time at or before `now` that a daily/weekly schedule was due. */
export function latestScheduledSlot(trigger: ScheduledTrigger, now: Date): Date {
  const [hours, minutes] = parseClock(trigger.time)
  const slot = new Date(now)
  slot.setHours(hours, minutes, 0, 0)
  if (slot.getTime() > now.getTime()) slot.setDate(slot.getDate() - 1)
  if (trigger.frequency === 'weekly') {
    while (slot.getDay() !== trigger.weekday) slot.setDate(slot.getDate() - 1)
  }
  return slot
}

/** Whether `firedAt` is exactly a slot of this schedule. */
export function isScheduledSlot(trigger: ScheduledTrigger, firedAt: string): boolean {
  const at = new Date(firedAt)
  if (Number.isNaN(at.getTime())) return false
  return latestScheduledSlot(trigger, at).getTime() === at.getTime()
}
