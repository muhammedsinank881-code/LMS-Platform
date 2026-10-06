import type { FollowUp, ReminderOffsetMinutes } from '@/types'

export type ReminderKind = 'due_soon' | 'overdue'

export interface ReminderHit {
  kind: ReminderKind
  followUpId: string
  dueAt: string
  key: string
  title: string
  body: string
}

type ReminderSource = Pick<FollowUp, 'id' | 'dueAt' | 'status' | 'type' | 'reminderOffsetMinutes'>

export function reminderKey(kind: ReminderKind, id: string, dueAt: string): string {
  return `${kind}:${id}:${dueAt}`
}

function inDueSoonWindow(due: number, offset: ReminderOffsetMinutes, now: number): boolean {
  const fireAt = due - offset * 60_000
  if (offset === 0) return now >= due && now < due + 60_000
  return now >= fireAt && now < due
}

/**
 * Follow-ups that should raise a reminder now.
 * `seen` holds keys already delivered, so the same due time is not repeated.
 */
export function collectReminders(
  items: readonly ReminderSource[],
  now: Date,
  seen: ReadonlySet<string>,
): ReminderHit[] {
  const hits: ReminderHit[] = []
  const at = now.getTime()
  for (const item of items) {
    if (item.status === 'done') continue
    const due = Date.parse(item.dueAt)
    if (Number.isNaN(due)) continue
    const offset = item.reminderOffsetMinutes
    if (offset !== null && inDueSoonWindow(due, offset, at)) {
      const key = reminderKey('due_soon', item.id, item.dueAt)
      if (!seen.has(key)) {
        hits.push({
          kind: 'due_soon',
          followUpId: item.id,
          dueAt: item.dueAt,
          key,
          title: 'Follow-up coming up',
          body: `${item.type} is due soon`,
        })
      }
    }
    const overdueAt = offset === 0 ? due + 60_000 : due
    if (at >= overdueAt) {
      const key = reminderKey('overdue', item.id, item.dueAt)
      if (!seen.has(key)) {
        hits.push({
          kind: 'overdue',
          followUpId: item.id,
          dueAt: item.dueAt,
          key,
          title: 'Follow-up overdue',
          body: `${item.type} is overdue`,
        })
      }
    }
  }
  return hits
}
