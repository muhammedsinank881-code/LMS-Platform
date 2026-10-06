import { describe, expect, it } from 'vitest'
import { findDuplicates } from '@/lib/duplicates'
import { bucketFollowUps } from '@/lib/followup-buckets'
import { ROLES } from '@/types'
import { createSeedState } from '../seed'
import { ACME_TENANT_ID, NORTHWIND_TENANT_ID, NOW } from './helpers'

const state = createSeedState({ now: NOW })
const t = state.tables
const acme = <T extends { tenantId: string }>(rows: T[]): T[] =>
  rows.filter((r) => r.tenantId === ACME_TENANT_ID)

describe('seed data', () => {
  it('has two workspaces and stamps every row with its tenant', () => {
    expect(new Set(t.leads.map((l) => l.tenantId))).toEqual(
      new Set([ACME_TENANT_ID, NORTHWIND_TENANT_ID]),
    )
    for (const rows of Object.values(t)) {
      for (const row of rows) expect(row.tenantId).toBeTruthy()
    }
  })

  it('seeds the full Acme workspace to the spec', () => {
    expect(acme(t.users)).toHaveLength(10)
    expect(new Set(acme(t.users).map((u) => u.role))).toEqual(new Set(ROLES))
    expect(acme(t.teams)).toHaveLength(2)
    expect(acme(t.leadStatuses)).toHaveLength(12)
    expect(acme(t.stages)).toHaveLength(12)
    expect(acme(t.leads)).toHaveLength(200)
    expect(acme(t.followUps)).toHaveLength(80)
    expect(acme(t.deals).length).toBeGreaterThanOrEqual(36)
    expect(acme(t.deals).length).toBeLessThanOrEqual(40)
    expect(acme(t.campaigns)).toHaveLength(12)
    expect(acme(t.conversations)).toHaveLength(16)
    expect(acme(t.automations)).toHaveLength(5)
    expect(acme(t.auditLogs)).toHaveLength(100)
    expect(acme(t.activities).length).toBeGreaterThan(260)
    expect(acme(t.activities).length).toBeLessThan(360)
  })

  it('uses every status and every source', () => {
    const leads = acme(t.leads)
    for (const status of acme(t.leadStatuses)) {
      expect(
        leads.some((l) => l.statusId === status.id),
        status.name,
      ).toBe(true)
    }
    for (const source of acme(t.leadSources)) {
      expect(
        leads.some((l) => l.sourceId === source.id),
        source.name,
      ).toBe(true)
    }
  })

  it('spreads follow-ups across overdue, today, tomorrow and upcoming', () => {
    const buckets = bucketFollowUps(acme(t.followUps), NOW)
    expect(buckets.overdue).toBeGreaterThan(10)
    expect(buckets.today).toBeGreaterThan(8)
    expect(buckets.tomorrow).toBeGreaterThan(5)
    expect(buckets.upcoming).toBeGreaterThan(10)
  })

  it('plants same-phone duplicates under different names', () => {
    const leads = acme(t.leads)
    const flagged = leads.filter((l) => l.duplicateOf)
    expect(flagged.length).toBeGreaterThanOrEqual(8)
    for (const lead of flagged) {
      const original = leads.find((l) => l.id === lead.duplicateOf)
      expect(original).toBeDefined()
      expect(original?.name).not.toBe(lead.name)
      expect(findDuplicates(lead, leads).some((m) => m.lead.id === original?.id)).toBe(true)
    }
  })

  it('is deterministic for the same seed and clock', () => {
    const again = createSeedState({ now: NOW })
    expect(again.tables.leads).toEqual(t.leads)
    expect(again.tables.followUps).toEqual(t.followUps)
    expect(again.tables.deals).toEqual(t.deals)
    expect(again.tables.activities).toEqual(t.activities)
  })

  it('never lets ids collide inside a workspace', () => {
    for (const table of ['leads', 'deals', 'customers', 'followUps', 'activities', 'tasks'] as const) {
      const ids = acme(t[table] as Array<{ tenantId: string; id: string }>).map((r) => r.id)
      expect(new Set(ids).size, table).toBe(ids.length)
    }
  })
})
