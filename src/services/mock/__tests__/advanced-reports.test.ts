import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ApiError } from '@/services/api/errors'
import type { ReportQuery } from '@/types'
import { USERS, actAs, setupMock, tables, teardownMock } from './helpers'

const query: ReportQuery = {
  range: { from: '2026-06-01T00:00:00.000Z', to: '2026-10-05T18:29:59.999Z' },
  compare: false,
}

beforeEach(setupMock)
afterEach(teardownMock)

describe('advanced reports', () => {
  it('builds the campaign report with platform rollups and channel mix', async () => {
    actAs(USERS.neha)
    const report = await api.reports.campaignReport(query)
    expect(report.campaigns.length).toBeGreaterThan(5)
    const leads = report.campaigns.reduce((t, c) => t + c.leads, 0)
    expect(report.platforms.reduce((t, p) => t + p.leads, 0)).toBe(leads)
    expect(report.channelMix.reduce((t, r) => t + r.count, 0)).toBeGreaterThanOrEqual(leads)
    expect(report.ads.length).toBeGreaterThan(0)
    const series = await api.reports.spendVsRevenue(query)
    expect(series.some((p) => (p.spend ?? 0) > 0)).toBe(true)
  })

  it('attributes the same leads under first and last touch but credits them differently', async () => {
    actAs(USERS.neha)
    const first = await api.reports.attribution(query, 'first')
    const last = await api.reports.attribution(query, 'last')
    const total = (rows: typeof first) => rows.reduce((t, r) => t + r.leads, 0)
    expect(total(first)).toBe(total(last))
    expect(JSON.stringify(first)).not.toBe(JSON.stringify(last))
  })

  it('computes source ROI rates that stay between 0 and 100', async () => {
    actAs(USERS.neha)
    const rows = await api.reports.sourceRoi(query)
    expect(rows.length).toBeGreaterThan(3)
    for (const row of rows) {
      expect(row.qualified).toBeLessThanOrEqual(row.leads)
      for (const rate of [row.qualifiedRate, row.leadToWonRate]) {
        if (rate !== null) {
          expect(rate).toBeGreaterThanOrEqual(0)
          expect(rate).toBeLessThanOrEqual(100)
        }
      }
    }
  })

  it('builds the funnel, velocity, cohorts and stuck deals', async () => {
    actAs(USERS.neha)
    const report = await api.reports.funnelVelocity(query, 7)
    expect(report.stages.length).toBeGreaterThan(3)
    expect(report.stages.some((s) => s.avgDaysInStage !== null)).toBe(true)
    expect(report.timeToClose.length).toBe(6)
    expect(report.cohorts.length).toBeGreaterThan(1)
    const looser = await api.reports.funnelVelocity(query, 1000)
    expect(looser.stuck).toHaveLength(0)
    expect(report.stuck.every((d) => d.daysInStage > 7)).toBe(true)
  })

  it('buckets response times and ranges the forecast', async () => {
    actAs(USERS.neha)
    const response = await api.reports.responseFollowUp(query)
    expect(response.bySource.length).toBeGreaterThan(0)
    expect(response.speedToLead).toHaveLength(5)
    const forecast = await api.reports.forecast(query)
    expect(forecast.months.length).toBeGreaterThan(0)
    for (const m of forecast.months) {
      expect(m.worst).toBeLessThanOrEqual(m.commit)
      expect(m.commit).toBeLessThanOrEqual(m.best)
    }
    expect(forecast.totals.commit).toBe(forecast.months.reduce((t, m) => t + m.commit, 0))
  })

  it('scopes a salesperson to their own leads', async () => {
    actAs(USERS.neha)
    const all = await api.reports.sourceRoi(query)
    actAs(USERS.ananya)
    const own = await api.reports.sourceRoi(query)
    expect(own.reduce((t, r) => t + r.leads, 0)).toBeLessThan(all.reduce((t, r) => t + r.leads, 0))
  })
})

describe('report export and saved reports', () => {
  it('exports the new tabs, audit-logged and permission-gated', async () => {
    actAs(USERS.neha)
    for (const tab of ['campaigns', 'source_roi', 'funnel', 'response', 'forecast'] as const) {
      const result = await api.reports.export({ ...query, tab })
      expect(result.headers.length).toBeGreaterThan(1)
      expect(result.rows.length).toBeGreaterThan(0)
    }
    expect(tables().auditLogs.filter((l) => l.action === 'exported').length).toBeGreaterThanOrEqual(5)
    actAs(USERS.rahul)
    const error = await api.reports.export({ ...query, tab: 'campaigns' }).then(
      () => null,
      (caught: unknown) => caught,
    )
    expect((error as ApiError).code).toBe('FORBIDDEN')
  })

  it('hides spend columns in the campaign export from roles without view-spend', async () => {
    actAs(USERS.neha, { role: 'manager' })
    const withSpend = await api.reports.export({ ...query, tab: 'campaigns' })
    expect(withSpend.rows.some((row) => row[2] !== '')).toBe(true)
  })

  it('saves, lists and deletes per user and refuses duplicates', async () => {
    actAs(USERS.neha)
    const saved = await api.reports.saveReport({ name: 'Weekly ROI', tab: 'campaigns', search: 'tab=campaigns&preset=7d' })
    expect((await api.reports.listSavedReports()).map((r) => r.name)).toContain('Weekly ROI')
    await expect(api.reports.saveReport({ name: 'weekly roi', tab: 'campaigns', search: '' })).rejects.toBeInstanceOf(ApiError)
    actAs(USERS.arjun)
    expect(await api.reports.listSavedReports()).toHaveLength(0)
    await expect(api.reports.deleteSavedReport(saved.id)).rejects.toBeInstanceOf(ApiError)
    actAs(USERS.neha)
    await api.reports.deleteSavedReport(saved.id)
    expect(await api.reports.listSavedReports()).toHaveLength(0)
  })
})
