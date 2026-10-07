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
  let db: MockAuthDb | null = null
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
     if (isMockAuthDb(parsed)) {
  const seeded = createSeedAuthDb()
  let modified = false

  for (const user of seeded.users) {
    if (
      !parsed.users.some(
        (u) => normalizeEmail(u.email) === normalizeEmail(user.email)
      )
    ) {
      parsed.users.push(user)
      modified = true
    }
  }

  for (const membership of seeded.memberships) {
    if (
      !parsed.memberships.some(
        (m) =>
          m.userId === membership.userId &&
          m.tenantId === membership.tenantId
      )
    ) {
      parsed.memberships.push(membership)
      modified = true
    }
  }

  if (modified) writeDb(parsed)

  return parsed
}
    }
  } catch {
    // Corrupt storage: fall through and reseed.
  }

  const seeded = createSeedAuthDb()
  if (!db) {
    db = seeded
    writeDb(db)
    return db
  }

  let modified = false

  for (const seedTenant of seeded.tenants) {
    if (!db.tenants.some((t) => t.id === seedTenant.id)) {
      db.tenants.push(seedTenant)
      modified = true
    }
  }

  for (const seedUser of seeded.users) {
    const existing = db.users.find((u) => normalizeEmail(u.email) === normalizeEmail(seedUser.email))
    if (!existing) {
      db.users.push(seedUser)
      modified = true
    } else if (existing.password !== seedUser.password) {
      existing.password = seedUser.password
      modified = true
    }
  }

  for (const seedMem of seeded.memberships) {
    if (!db.memberships.some((m) => m.userId === seedMem.userId && m.tenantId === seedMem.tenantId)) {
      db.memberships.push(seedMem)
      modified = true
    }
  }

  if (modified) {
    writeDb(db)
  }

  return db
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
