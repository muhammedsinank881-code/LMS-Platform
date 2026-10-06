import { createRequestContext } from '@/services/mock/core/context'
import { getMockState } from '@/services/mock/core/state'
import { getMockSession } from '@/services/mock/session'
import { setMockClock } from '@/services/mock'
import type { Automation, AutomationContent, DomainEvent, EventData } from '@/types'
import { ACME_TENANT_ID, NOW, USERS, tables } from './helpers'

/** A clock the test can move. Call `useMovableClock()` after `setupMock()`. */
export const clock = { now: new Date(NOW) }

export function useMovableClock(): void {
  clock.now = new Date(NOW)
  setMockClock(() => clock.now)
}

export const advanceHours = (hours: number) => {
  clock.now = new Date(clock.now.getTime() + hours * 3_600_000)
}

let counter = 0

/** Adds a published, enabled automation straight to the store (the API's validation is tested elsewhere). */
export function install(
  content: Partial<AutomationContent> & { name: string },
  overrides: Partial<Automation> = {},
): Automation {
  counter += 1
  const automation: Automation = {
    id: `auto-test-${counter}`,
    tenantId: ACME_TENANT_ID,
    description: '',
    trigger: { type: 'lead_created', sourceIds: [] },
    conditions: { logic: 'and', items: [] },
    actions: [],
    status: 'published',
    enabled: true,
    version: 1,
    runCount: 0,
    lastRunAt: null,
    errorCount: 0,
    consecutiveFailures: 0,
    createdBy: USERS.arjun,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...content,
    ...overrides,
  }
  tables().automations.push(automation)
  return automation
}

export function disableSeededAutomations(): void {
  for (const a of tables().automations) a.enabled = false
}

export const runsOf = (automationId: string) =>
  tables().automationRuns.filter((r) => r.automationId === automationId)

export const facebookSourceId = () =>
  tables().leadSources.find((s) => s.tenantId === ACME_TENANT_ID && s.key === 'facebook')!.id

export const websiteSourceId = () =>
  tables().leadSources.find((s) => s.tenantId === ACME_TENANT_ID && s.key === 'website')!.id

/** A request context for calling engine functions directly, as the current session. */
export function engineContext() {
  return createRequestContext(getMockState(), getMockSession(), clock.now)
}

let eventCounter = 0

export function leadEvent(
  type: DomainEvent['type'],
  leadId: string,
  data: EventData = {},
  id?: string,
): DomainEvent {
  eventCounter += 1
  return {
    id: id ?? `evt-test-${eventCounter}`,
    tenantId: ACME_TENANT_ID,
    type,
    entity: { kind: 'lead', id: leadId },
    occurredAt: clock.now.toISOString(),
    data,
    chain: { chainId: `chain-test-${eventCounter}`, depth: 0, causedBy: [] },
  }
}
