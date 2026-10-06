import type { TimelineLookups } from '@/components/common/timeline'
import { sourceById, statusById, userById, type LeadLookups } from '../../types'

export function toTimelineLookups(lookups: LeadLookups): TimelineLookups {
  return {
    status: (id) => {
      const status = statusById(lookups, id)
      return status ? { name: status.name, color: status.color } : undefined
    },
    userName: (id) => userById(lookups, id)?.name ?? (id ? 'Someone' : 'System'),
    sourceName: (id) => sourceById(lookups, id)?.name ?? id,
  }
}
