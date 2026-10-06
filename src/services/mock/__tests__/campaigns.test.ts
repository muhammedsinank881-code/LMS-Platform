import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ApiError } from '@/services/api/errors'
import type { BreakdownMetricsRow, CampaignMetrics, CampaignMetricsQuery } from '@/types'
import { NORTHWIND_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from './helpers'

const query: CampaignMetricsQuery = {
  range: { from: '2026-01-01T00:00:00.000Z', to: '2026-10-05T18:29:59.999Z' },
}
const WIDE = { range: query.range, pageSize: 100 }

beforeEach(setupMock)
afterEach(teardownMock)

const codeOf = async (promise: Promise<unknown>) =>
  promise.then(
    () => null,
    (error: unknown) => (error instanceof ApiError ? error.code : 'OTHER'),
  )

const sum = (rows: BreakdownMetricsRow[], pick: (m: CampaignMetrics) => number | null) =>
  rows.reduce((total, row) => total + (pick(row.metrics) ?? 0), 0)

describe('seeded campaigns', () => {
  it('has 10+ campaigns with non-trivial metrics', async () => {
    actAs(USERS.neha)
    const { items } = await api.campaigns.list(WIDE)
    expect(items.length).toBeGreaterThanOrEqual(10)
    const live = items.filter((c) => c.status !== 'draft')
    expect(live.every((c) => (c.metrics.spend ?? 0) > 0)).toBe(true)
    expect(items.filter((c) => c.metrics.leads > 0).length).toBeGreaterThanOrEqual(8)
    expect(items.some((c) => (c.metrics.revenue ?? 0) > 0)).toBe(true)
    expect(items.some((c) => (c.metrics.roas ?? 0) > 0)).toBe(true)
    expect(items.some((c) => c.metrics.qualified > 0)).toBe(true)
    expect(tables().adSets.length).toBeGreaterThan(20)
    expect(tables().spendEntries.length).toBeGreaterThan(1000)
  })
})

describe('campaign metrics', () => {
  it('makes ad set and ad figures add up to the campaign totals', async () => {
    actAs(USERS.neha)
    const { items } = await api.campaigns.list(WIDE)
    for (const campaign of items.filter((c) => c.metrics.leads > 0)) {
      const rows = await api.campaigns.getBreakdown(campaign.id, query)
      const m = campaign.metrics
      expect(sum(rows, (x) => x.leads)).toBe(m.leads)
      expect(sum(rows, (x) => x.qualified)).toBe(m.qualified)
      expect(sum(rows, (x) => x.deals)).toBe(m.deals)
      expect(sum(rows, (x) => x.revenue)).toBeCloseTo(m.revenue ?? 0, 2)
      expect(sum(rows, (x) => x.spend)).toBeCloseTo(m.spend ?? 0, 2)

      const ads = rows.flatMap((row) => row.children)
      const setRows = rows.filter((row) => row.id !== 'unallocated')
      expect(sum(ads, (x) => x.leads)).toBe(sum(setRows, (x) => x.leads))
      expect(sum(ads, (x) => x.spend)).toBeCloseTo(sum(setRows, (x) => x.spend), 2)
    }
  })

  it('keeps the funnel, detail and series consistent with the totals', async () => {
    actAs(USERS.neha)
    const { items } = await api.campaigns.list(WIDE)
    const campaign = items.find((c) => c.metrics.wonDeals > 0) ?? items[0]
    if (!campaign) throw new Error('no campaigns')
    const funnel = await api.campaigns.getFunnel(campaign.id, query)
    expect(funnel.map((s) => s.label)).toEqual(['Spend', 'Leads', 'Qualified', 'Deals', 'Revenue'])
    expect(funnel[1]?.value).toBe(campaign.metrics.leads)
    expect(funnel[0]?.conversionFromPrevious).toBeNull()
    const series = await api.campaigns.getTimeSeries(campaign.id, query)
    expect(series.reduce((t, p) => t + p.leads, 0)).toBe(campaign.metrics.leads)
    expect(series.reduce((t, p) => t + (p.spend ?? 0), 0)).toBeCloseTo(campaign.metrics.spend ?? 0, 2)
    const detail = await api.campaigns.getDetail(campaign.id, { ...query, compare: true })
    expect(detail.previous).not.toBeNull()
    expect(detail.tenantAvgCpl).toBeGreaterThan(0)
  })

  it('isolates tenants', async () => {
    actAs(USERS.neha)
    const acme = await api.campaigns.list(WIDE)
    actAs(USERS.priya, { tenantId: NORTHWIND_TENANT_ID })
    const northwind = await api.campaigns.list(WIDE)
    const acmeIds = new Set(acme.items.map((c) => c.id))
    expect(northwind.items.length).toBeGreaterThan(0)
    expect(northwind.items.some((c) => acmeIds.has(c.id))).toBe(false)
    const [first] = acme.items
    if (!first) throw new Error('no campaigns')
    expect(await codeOf(api.campaigns.get(first.id))).toBe('NOT_FOUND')
    expect(await codeOf(api.campaigns.getBreakdown(first.id, query))).toBe('NOT_FOUND')
  })

  it('narrows lead counts by role scope', async () => {
    actAs(USERS.neha)
    const all = await api.campaigns.list(WIDE)
    actAs(USERS.rahul)
    const team = await api.campaigns.list(WIDE)
    const leads = (rows: typeof all) => rows.items.reduce((t, c) => t + c.metrics.leads, 0)
    expect(leads(team)).toBeGreaterThan(0)
    expect(leads(team)).toBeLessThan(leads(all))
  })

  it('refuses roles with no campaign access', async () => {
    actAs(USERS.ananya)
    expect(await codeOf(api.campaigns.list(WIDE))).toBe('FORBIDDEN')
  })
})

describe('view-spend permission', () => {
  it('hides spend and revenue figures from roles without it', async () => {
    actAs(USERS.rahul)
    const { items } = await api.campaigns.list(WIDE)
    for (const c of items) {
      expect(c.metrics).toMatchObject({ spend: null, revenue: null, cpl: null, cac: null, roas: null })
      expect(typeof c.metrics.leads).toBe('number')
    }
    const first = items[0]
    if (!first) throw new Error('no campaigns')
    const rows = await api.campaigns.getBreakdown(first.id, query)
    expect(rows.every((row) => row.metrics.spend === null)).toBe(true)
    const funnel = await api.campaigns.getFunnel(first.id, query)
    expect(funnel[0]?.value).toBeNull()
    expect(funnel[4]?.value).toBeNull()
    const report = await api.reports.campaignReport({ range: query.range })
    expect(report.spendHidden).toBe(true)
    expect(report.campaigns.every((row) => row.spend === null && row.revenue === null)).toBe(true)
  })

  it('blocks the spend API without it, and shows figures with it', async () => {
    actAs(USERS.rahul)
    const first = (await api.campaigns.list(WIDE)).items.find((c) => c.status !== 'draft')
    if (!first) throw new Error('no campaigns')
    expect(await codeOf(api.spend.list({ campaignId: first.id }))).toBe('FORBIDDEN')
    actAs(USERS.neha)
    const page = await api.spend.list({ campaignId: first.id, pageSize: 10 })
    expect(page.items.length).toBeGreaterThan(0)
    const report = await api.reports.campaignReport({ range: query.range })
    expect(report.spendHidden).toBe(false)
    expect(report.campaigns.some((row) => (row.spend ?? 0) > 0)).toBe(true)
  })
})

describe('spend entries', () => {
  it('creates, updates, deletes and imports with an audit trail', async () => {
    actAs(USERS.neha)
    const campaign = (await api.campaigns.list(WIDE)).items.find((c) => c.status === 'active')
    if (!campaign) throw new Error('no campaign')
    const before = campaign.metrics.spend ?? 0
    const entry = await api.spend.create({
      campaignId: campaign.id,
      date: '2026-10-01',
      amount: 1000,
      currency: 'INR',
      notes: 'test',
    })
    expect(entry.source).toBe('manual')
    expect((await api.campaigns.get(campaign.id)).metrics.spend).toBeGreaterThanOrEqual(before + 1000 - 0.01)
    await api.spend.update(entry.id, { amount: 2000 })
    await api.spend.delete(entry.id)
    expect(await codeOf(api.spend.create({ campaignId: campaign.id, date: 'bad', amount: 5, currency: 'INR', notes: '' }))).toBe('VALIDATION')

    const result = await api.spend.importCsv(campaign.id, [
      { date: '2026-10-02', amount: '1,500' },
      { date: '2026-10-03', amount: '-4' },
      { date: '2026-10-03', amount: '10', adSet: 'Nope' },
    ])
    expect(result).toMatchObject({ imported: 1, skipped: 2 })
    expect(result.errors.map((e) => e.row)).toEqual([3, 4])
    expect(tables().auditLogs.some((log) => log.entity === 'spend' && log.action === 'imported')).toBe(true)
  })

  it('archives, pauses and resumes campaigns in bulk', async () => {
    actAs(USERS.neha)
    const { items } = await api.campaigns.list(WIDE)
    const active = items.filter((c) => c.status === 'active').slice(0, 2)
    await api.campaigns.bulkAction(active.map((c) => c.id), 'pause')
    expect((await api.campaigns.get(active[0]?.id ?? '')).status).toBe('paused')
    await api.campaigns.bulkAction(active.map((c) => c.id), 'resume')
    expect((await api.campaigns.get(active[0]?.id ?? '')).status).toBe('active')
    await api.campaigns.bulkAction([active[0]?.id ?? ''], 'archive')
    const visible = await api.campaigns.list(WIDE)
    expect(visible.items.some((c) => c.id === active[0]?.id)).toBe(false)
  })
})
