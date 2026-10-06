import { setMockClock } from '@/services/mock'
import type { Lead } from '@/types'
import { ACME_TENANT_ID, NOW, tables } from './helpers'

/** Fails the test loudly when a seeded fixture is missing, instead of letting it pass vacuously. */
export function must<T>(value: T | undefined | null, what: string): T {
  if (value === undefined || value === null) throw new Error(`Missing test fixture: ${what}`)
  return value
}

/** A seeded Acme lead owned by the user that has the given contact detail. */
export function leadOwnedBy(userId: string, contact: 'phone' | 'email'): Lead {
  return must(
    tables().leads.find(
      (lead) => lead.tenantId === ACME_TENANT_ID && lead.assignedTo === userId && !lead.archivedAt && lead[contact],
    ),
    `a ${contact} lead owned by ${userId}`,
  )
}

/** Moves the mock clock forward from the pinned test time. */
export function advance(ms: number): void {
  setMockClock(() => new Date(NOW.getTime() + ms))
}

export const TEMPLATE_BODY = 'Hi {{lead.name}}, your quote is ready. {{owner.name}} will call you.'
