import type { Role, Tenant } from '@/types'
import { createSeedAuthDb } from './auth-seed'

/**
 * FAKE persistence for the mock backend. Passwords are stored in plain text in localStorage
 * purely so a registered demo account survives a reload. A real API never does this.
 */
export interface MockUserRecord {
  id: string
  name: string
  email: string
  password: string
  teamId: string | null
}

export interface MockMembership {
  userId: string
  tenantId: string
  role: Role
}

export interface MockInvitation {
  token: string
  email: string
  tenantId: string
  role: Role
  invitedByName: string
}

export interface MockSessionRecord {
  userId: string
  tenantId: string
}

export interface MockAuthDb {
  tenants: Tenant[]
  users: MockUserRecord[]
  memberships: MockMembership[]
  invitations: MockInvitation[]
  sessions: Record<string, MockSessionRecord>
}

const DB_KEY = 'leadflow-mock-auth-db'

function isMockAuthDb(value: unknown): value is MockAuthDb {
  if (typeof value !== 'object' || value === null) return false
  const db = value as Partial<MockAuthDb>
  return (
    Array.isArray(db.tenants) &&
    Array.isArray(db.users) &&
    Array.isArray(db.memberships) &&
    Array.isArray(db.invitations) &&
    typeof db.sessions === 'object' &&
    db.sessions !== null
  )
}

export function readDb(): MockAuthDb {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isMockAuthDb(parsed)) return parsed
    }
  } catch {
    // Corrupt storage: fall through and reseed.
  }
  const seeded = createSeedAuthDb()
  writeDb(seeded)
  return seeded
}

export function writeDb(db: MockAuthDb): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}
