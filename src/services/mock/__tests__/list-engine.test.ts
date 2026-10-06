import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { dateWindowForPreset } from '@/lib/filters/date-presets'
import { api } from '@/services/api'
import { ApiError } from '@/services/api/errors'
import type { FilterCondition, Lead, LeadFilterField, LeadListParams } from '@/types'
import { ACME_TENANT_ID, NOW, USERS, actAs, setupMock, tables, teardownMock } from './helpers'

beforeEach(() => {
  setupMock()
  actAs(USERS.arjun)
})
afterEach(teardownMock)

const BIG = 200
type Filter = FilterCondition<LeadFilterField>

const acmeLeads = (): Lead[] =>
  tables().leads.filter((l) => l.tenantId === ACME_TENANT_ID && !l.archivedAt)

async function run(filters: Filter[], extra: LeadListParams = {}) {
  return api.leads.list({ pageSize: BIG, ...extra, filters })
}

describe('filter operators', () => {
  it('equals and not_equals', async () => {
    const leads = acmeLeads()
    const statusId = leads[0].statusId
    const eq = await run([{ field: 'statusId', operator: 'equals', value: statusId }])
    expect(eq.total).toBe(leads.filter((l) => l.statusId === statusId).length)
    expect(eq.items.every((l) => l.statusId === statusId)).toBe(true)

    const ne = await run([{ field: 'statusId', operator: 'not_equals', value: statusId }])
    expect(ne.total).toBe(leads.length - eq.total)
  })

  it('contains is case-insensitive', async () => {
    const word = (acmeLeads().find((l) => l.location) as Lead).location as string
    const result = await run([{ field: 'location', operator: 'contains', value: word.toUpperCase() }])
    expect(result.total).toBe(
      acmeLeads().filter((l) => l.location?.toLowerCase().includes(word.toLowerCase())).length,
    )
    expect(result.total).toBeGreaterThan(0)
  })

  it('in matches any listed value', async () => {
    const [a, b] = [...new Set(acmeLeads().map((l) => l.sourceId))]
    const result = await run([{ field: 'sourceId', operator: 'in', value: [a, b] }])
    expect(result.total).toBe(acmeLeads().filter((l) => l.sourceId === a || l.sourceId === b).length)
  })

  it('in also matches against a lead’s tags', async () => {
    const tag = acmeLeads().flatMap((l) => l.tags)[0]
    const result = await run([{ field: 'tags', operator: 'in', value: [tag] }])
    expect(result.total).toBe(acmeLeads().filter((l) => l.tags.includes(tag)).length)
  })

  it('gt and lt compare numbers', async () => {
    const gt = await run([{ field: 'score', operator: 'gt', value: 60 }])
    expect(gt.total).toBe(acmeLeads().filter((l) => l.score > 60).length)
    expect(gt.items.every((l) => l.score > 60)).toBe(true)
    const lt = await run([{ field: 'score', operator: 'lt', value: 30 }])
    expect(lt.items.every((l) => l.score < 30)).toBe(true)
    expect(lt.total).toBe(acmeLeads().filter((l) => l.score < 30).length)
  })

  it('between is inclusive', async () => {
    const result = await run([{ field: 'score', operator: 'between', value: [40, 70] }])
    expect(result.total).toBe(acmeLeads().filter((l) => l.score >= 40 && l.score <= 70).length)
    expect(result.total).toBeGreaterThan(0)
  })

  it('between works on dates', async () => {
    const from = '2026-09-01T00:00:00.000Z'
    const to = '2026-09-30T23:59:59.999Z'
    const result = await run([{ field: 'createdAt', operator: 'between', value: [from, to] }])
    expect(result.total).toBe(acmeLeads().filter((l) => l.createdAt >= from && l.createdAt <= to).length)
  })

  it('is_empty and is_not_empty', async () => {
    const empty = await run([{ field: 'campaignId', operator: 'is_empty' }])
    const filled = await run([{ field: 'campaignId', operator: 'is_not_empty' }])
    expect(empty.total).toBe(acmeLeads().filter((l) => !l.campaignId).length)
    expect(empty.total + filled.total).toBe(acmeLeads().length)
    expect(empty.total).toBeGreaterThan(0)
    expect(filled.total).toBeGreaterThan(0)
  })

  it('date_preset relative to the pinned clock', async () => {
    for (const preset of ['today', 'this_week', 'this_month', 'last_30_days'] as const) {
      const { start, end } = dateWindowForPreset(preset, NOW)
      const expected = acmeLeads().filter((l) => {
        const at = new Date(l.createdAt)
        return at >= start && at <= end
      })
      const result = await run([{ field: 'createdAt', operator: 'date_preset', value: preset }])
      expect(result.total, preset).toBe(expected.length)
    }
    const days = await run([{ field: 'createdAt', operator: 'date_preset', value: 'last_30_days' }])
    expect(days.total).toBeGreaterThan(0)
    expect(days.total).toBeLessThan(acmeLeads().length)
  })

  it('combines conditions with AND', async () => {
    const result = await run([
      { field: 'priority', operator: 'equals', value: 'high' },
      { field: 'score', operator: 'gt', value: 50 },
    ])
    expect(result.items.every((l) => l.priority === 'high' && l.score > 50)).toBe(true)
  })

  it('filters on virtual fields', async () => {
    const dupes = await run([{ field: 'isDuplicate', operator: 'equals', value: true }])
    expect(dupes.total).toBe(acmeLeads().filter((l) => l.duplicateOf).length)
    const overdue = await run([{ field: 'followUpBucket', operator: 'equals', value: 'overdue' }])
    expect(overdue.total).toBeGreaterThan(0)
    expect(overdue.items.every((l) => l.nextFollowUpAt && l.nextFollowUpAt < '2026-10-04T06:00:00.000Z')).toBe(true)
  })

  it('rejects unknown filter and sort fields', async () => {
    const bad = { field: 'nope', operator: 'equals', value: 1 } as unknown as Filter
    await expect(run([bad])).rejects.toMatchObject({ code: 'VALIDATION' })
    const badSort = { sort: [{ field: 'nope', direction: 'asc' }] } as unknown as LeadListParams
    await expect(api.leads.list(badSort)).rejects.toBeInstanceOf(ApiError)
  })
})

describe('search', () => {
  it('matches names regardless of case', async () => {
    const target = acmeLeads()[3]
    const first = target.name.split(' ')[0]
    const result = await api.leads.list({ search: first.toUpperCase(), pageSize: BIG })
    expect(result.items.some((l) => l.id === target.id)).toBe(true)
    expect(result.items.every((l) => JSON.stringify(l).toLowerCase().includes(first.toLowerCase()))).toBe(true)
  })

  it('requires every term to match', async () => {
    const target = acmeLeads().find((l) => l.company) as Lead
    const [name] = target.name.split(' ')
    const result = await api.leads.list({ search: `${name} ${target.company}`, pageSize: BIG })
    expect(result.items.some((l) => l.id === target.id)).toBe(true)
    const none = await api.leads.list({ search: `${name} zzzzqqq` })
    expect(none.total).toBe(0)
  })

  it('finds a phone number however it is typed', async () => {
    const target = acmeLeads().find((l) => l.phone) as Lead
    const digits = (target.phone as string).replace(/\D/g, '').slice(-10)
    const spaced = `${digits.slice(0, 5)} ${digits.slice(5)}`
    const result = await api.leads.list({ search: spaced, pageSize: BIG })
    expect(result.items.some((l) => l.id === target.id)).toBe(true)
  })

  it('finds a lead by id', async () => {
    const target = acmeLeads()[10]
    const result = await api.leads.list({ search: target.id })
    expect(result.items.map((l) => l.id)).toContain(target.id)
  })
})

describe('sorting', () => {
  it('sorts by a field in both directions', async () => {
    const asc = await api.leads.list({ pageSize: BIG, sort: [{ field: 'score', direction: 'asc' }] })
    const desc = await api.leads.list({ pageSize: BIG, sort: [{ field: 'score', direction: 'desc' }] })
    const scores = (r: typeof asc) => r.items.map((l) => l.score)
    expect(scores(asc)).toEqual([...scores(asc)].sort((a, b) => a - b))
    expect(scores(desc)).toEqual([...scores(desc)].sort((a, b) => b - a))
  })

  it('applies later sort keys as tie-breakers', async () => {
    const result = await api.leads.list({
      pageSize: BIG,
      sort: [
        { field: 'priority', direction: 'asc' },
        { field: 'score', direction: 'desc' },
      ],
    })
    for (let i = 1; i < result.items.length; i++) {
      const [a, b] = [result.items[i - 1], result.items[i]]
      if (a.priority === b.priority) expect(a.score).toBeGreaterThanOrEqual(b.score)
    }
  })

  it('defaults to newest first', async () => {
    const { items } = await api.leads.list({ pageSize: BIG })
    const dates = items.map((l) => l.createdAt)
    expect(dates).toEqual([...dates].sort().reverse())
  })
})

describe('pagination', () => {
  it('returns page metadata', async () => {
    const total = acmeLeads().length
    const result = await api.leads.list({ page: 1, pageSize: 25 })
    expect(result).toMatchObject({ total, page: 1, pageSize: 25, pageCount: Math.ceil(total / 25) })
    expect(result.items).toHaveLength(25)
  })

  it('pages do not overlap and cover everything', async () => {
    const pageSize = 40
    const first = await api.leads.list({ page: 1, pageSize })
    const seen: string[] = []
    for (let page = 1; page <= first.pageCount; page++) {
      seen.push(...(await api.leads.list({ page, pageSize })).items.map((l) => l.id))
    }
    expect(seen).toHaveLength(first.total)
    expect(new Set(seen).size).toBe(first.total)
  })

  it('returns a short last page and an empty page beyond the end', async () => {
    const total = acmeLeads().length
    const pageSize = 30
    const last = Math.ceil(total / pageSize)
    const tail = await api.leads.list({ page: last, pageSize })
    expect(tail.items).toHaveLength(total - (last - 1) * pageSize)
    const beyond = await api.leads.list({ page: last + 5, pageSize })
    expect(beyond.items).toEqual([])
    expect(beyond.total).toBe(total)
  })

  it('paginates the filtered set, not the whole table', async () => {
    const filters: Filter[] = [{ field: 'priority', operator: 'equals', value: 'high' }]
    const expected = acmeLeads().filter((l) => l.priority === 'high').length
    const result = await api.leads.list({ filters, pageSize: 5 })
    expect(result.total).toBe(expected)
    expect(result.pageCount).toBe(Math.ceil(expected / 5))
  })

  it('caps an oversized page size', async () => {
    const result = await api.leads.list({ pageSize: 10_000 })
    expect(result.pageSize).toBeLessThanOrEqual(BIG)
  })
})
