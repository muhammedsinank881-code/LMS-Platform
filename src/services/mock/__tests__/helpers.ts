import { setMockClock, setMockConfig, resetMockDb, setMockSessionResolver } from '@/services/mock'
import { getMockState } from '@/services/mock/core/state'
import { resetScheduler } from '@/services/mock/automation/scheduler'
import { resetScoringJobs } from '@/services/mock/resources/scoring'
import { ACME_TENANT_ID, NORTHWIND_TENANT_ID } from '@/services/mock/auth/auth-seed'
import type { Role } from '@/types'

export { ACME_TENANT_ID, NORTHWIND_TENANT_ID }

/** A fixed Sunday late morning in India, so date buckets are the same on every run. */
export const NOW = new Date('2026-10-04T06:00:00.000Z')

export const USERS = {
  priya: 'user-priya', // super_admin
  arjun: 'user-arjun', // admin
  neha: 'user-neha', // manager
  rahul: 'user-rahul', // team_leader, north team
  ananya: 'user-ananya', // salesperson, north team
  vikram: 'user-vikram', // salesperson, north team
  sneha: 'user-sneha', // salesperson, south team
  karan: 'user-karan', // team_leader, south team
} as const

/** Fresh seeded database, no latency, pinned clock. Call from `beforeEach`. */
export function setupMock(): void {
  setMockConfig({ minLatencyMs: 0, maxLatencyMs: 0, errorRate: 0 })
  setMockClock(() => NOW)
  resetMockDb({ now: NOW })
  resetScheduler()
  resetScoringJobs()
}

export function teardownMock(): void {
  setMockClock(null)
  setMockSessionResolver(null)
}

interface ActAsOptions {
  tenantId?: string
  /** Act with a different role than the user's own, like the dev role switcher. */
  role?: Role
}

/** Signs in as a seeded user for the following calls. */
export function actAs(userId: string, options: ActAsOptions = {}): void {
  const tenantId = options.tenantId ?? ACME_TENANT_ID
  const record = getMockState().tables.users.find((u) => u.tenantId === tenantId && u.id === userId)
  if (!record) throw new Error(`No seeded user ${userId} in ${tenantId}`)
  setMockSessionResolver(() => ({
    tenantId,
    user: {
      id: record.id,
      tenantId,
      name: record.name,
      email: record.email,
      role: options.role ?? record.role,
      teamId: record.teamId,
      avatarUrl: null,
    },
  }))
}

export function tables() {
  return getMockState().tables
}
