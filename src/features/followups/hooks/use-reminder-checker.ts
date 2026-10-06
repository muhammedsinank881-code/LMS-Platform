import { useEffect, useRef } from 'react'
import { toast } from '@/components/ui'
import { collectReminders, type ReminderHit } from '@/lib/reminders'
import { useAuthStore } from '@/store/auth-store'
import { useCreateNotification } from '@/features/notifications/hooks/use-create-notification'
import { useNotificationPreferences } from '@/features/notifications/hooks/use-notification-actions'
import { inAppEnabled, reminderSuppressed } from '@/lib/notification-prefs'
import { useFollowUps } from './use-followups'

const STORAGE_PREFIX = 'leadflow:reminders:'

function loadSeen(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [])
  } catch {
    return new Set()
  }
}

function saveSeen(userId: string, seen: Set<string>) {
  const keys = [...seen].slice(-400)
  localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(keys))
}

function deliver(hit: ReminderHit, notify: (hit: ReminderHit) => void) {
  toast({
    title: hit.title,
    description: hit.body,
    variant: hit.kind === 'overdue' ? 'warning' : 'info',
  })
  notify(hit)
}

/** Polls open follow-ups and raises each reminder once per due time. */
export function useReminderChecker() {
  const userId = useAuthStore((state) => state.user?.id)
  const followUps = useFollowUps({ pageSize: 200 })
  const { mutate } = useCreateNotification()
  const preferences = useNotificationPreferences()
  const primed = useRef(false)

  useEffect(() => {
    const items = followUps.data?.items
    if (!userId || !items) return
    const seen = loadSeen(userId)

    const announce = (hits: ReminderHit[], silenceOverdue: boolean) => {
      for (const hit of hits) {
        if (silenceOverdue && hit.kind === 'overdue') {
          seen.add(hit.key)
          continue
        }
        seen.add(hit.key)
        const type = hit.kind === 'overdue' ? 'followup_overdue' : 'followup_due'
        const prefs = preferences.data
        if (prefs && (!inAppEnabled(prefs, type) || reminderSuppressed(prefs, type, new Date()))) continue
        deliver(hit, (item) =>
          mutate({
            type,
            title: item.title,
            body: item.body,
            link: `/follow-ups?bucket=${item.kind === 'overdue' ? 'overdue' : 'today'}`,
          }),
        )
      }
      saveSeen(userId, seen)
    }

    const tick = () => announce(collectReminders(items, new Date(), seen), false)
    if (!primed.current) {
      primed.current = true
      announce(collectReminders(items, new Date(), seen), true)
    }
    const timer = window.setInterval(tick, 60_000)
    return () => window.clearInterval(timer)
  }, [followUps.data, mutate, preferences.data, userId])
}
