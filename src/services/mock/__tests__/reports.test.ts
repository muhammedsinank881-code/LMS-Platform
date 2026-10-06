import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ApiError } from '@/services/api/errors'
import type { ReportQuery } from '@/types'
import { ACME_TENANT_ID, NORTHWIND_TENANT_ID, USERS, actAs, setupMock, teardownMock } from './helpers'

const query: ReportQuery = {
  range: { from: '2026-06-01T00:00:00.000Z', to: '2026-10-05T18:29:59.999Z' },
  compare: false,
}

beforeEach(setupMock)
afterEach(teardownMock)

describe('reports scope', () => {
  it('keeps tenants apart and narrows by role', async () => {
    actAs(USERS.neha)
    const manager = await api.reports.summary(query)
    actAs(USERS.ananya)
    const salesperson = await api.reports.summary(query)
    actAs(USERS.rahul)
    const leader = await api.reports.summary(query)
    expect(salesperson.totalLeads.value).toBeLessThan(manager.totalLeads.value)
    expect(leader.totalLeads.value).toBeGreaterThan(salesperson.totalLeads.value)
    expect(leader.totalLeads.value).toBeLessThan(manager.totalLeads.value)

    actAs(USERS.priya, { tenantId: NORTHWIND_TENANT_ID })
    const other = await api.reports.summary(query)
    expect(other.totalLeads.value).not.toBe(manager.totalLeads.value)
    expect(other.range.from).toBe(query.range.from)
    void ACME_TENANT_ID
  })

  it('makes breakdown totals equal the sum of the rows', async () => {
    actAs(USERS.neha)
    const summary = await api.reports.summary(query)
    for (const dimension of ['source', 'status', 'campaign', 'location', 'salesperson'] as const) {
      const report = await api.reports.breakdown(query, dimension)
      expect(report.rows.reduce((sum, row) => sum + row.count, 0)).toBe(report.total)
      expect(report.total).toBe(summary.newLeads.value)
    }
    const lost = await api.reports.lostAnalysis(query)
    expect(lost.reasons.reduce((sum, row) => sum + row.count, 0)).toBe(lost.total)
    expect(lost.bySource.reduce((sum, row) => sum + row.count, 0)).toBe(lost.total)
  })

  it('refuses a salesperson export', async () => {
    actAs(USERS.ananya)
    const error = await api.reports.export({ ...query, tab: 'leads' }).then(
      () => null,
      (caught: unknown) => caught,
    )
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe('FORBIDDEN')
  })
})
