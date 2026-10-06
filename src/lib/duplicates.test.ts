import { describe, expect, it } from 'vitest'
import { makeLead } from '@/test/factories'
import {
  compareContacts,
  findDuplicates,
  groupDuplicates,
  normalizeCompany,
  normalizeEmail,
} from './duplicates'

describe('normalizers', () => {
  it('normalizes email', () => {
    expect(normalizeEmail('  Rahul@Example.COM ')).toBe('rahul@example.com')
    expect(normalizeEmail('nope')).toBeNull()
    expect(normalizeEmail(null)).toBeNull()
  })

  it('normalizes company names, ignoring legal suffixes and punctuation', () => {
    expect(normalizeCompany('Sharma Traders Pvt. Ltd.')).toBe('sharma traders')
    expect(normalizeCompany('SHARMA  TRADERS')).toBe('sharma traders')
    expect(normalizeCompany('Pvt Ltd')).toBeNull()
    expect(normalizeCompany(null)).toBeNull()
  })
})

describe('findDuplicates', () => {
  const existing = [
    makeLead({
      id: 'L-10001',
      name: 'Amit Kumar',
      phone: '+919876543210',
      createdAt: '2026-08-01T00:00:00Z',
    }),
    makeLead({
      id: 'L-10002',
      name: 'Sunita Rao',
      email: 'sunita@rao.in',
      createdAt: '2026-08-02T00:00:00Z',
    }),
    makeLead({
      id: 'L-10003',
      name: 'Dev Patel',
      whatsapp: '+919811122233',
      createdAt: '2026-08-03T00:00:00Z',
    }),
    makeLead({
      id: 'L-10004',
      name: 'Meera Joshi',
      company: 'Joshi Foods Pvt Ltd',
      createdAt: '2026-08-04T00:00:00Z',
    }),
    makeLead({
      id: 'L-10005',
      name: 'Archived',
      phone: '+919876543210',
      archivedAt: '2026-08-05T00:00:00Z',
    }),
  ]

  it('matches the same phone typed differently, with high confidence', () => {
    const [match] = findDuplicates({ phone: '098765 43210' }, existing)
    expect(match.lead.id).toBe('L-10001')
    expect(match.confidence).toBe('high')
    expect(match.matchedOn).toEqual(['phone'])
  })

  it('matches email regardless of case, with high confidence', () => {
    const [match] = findDuplicates({ email: 'SUNITA@rao.in' }, existing)
    expect(match.lead.id).toBe('L-10002')
    expect(match.confidence).toBe('high')
  })

  it('treats a WhatsApp-only match as medium confidence', () => {
    const [match] = findDuplicates({ whatsapp: '98111 22233' }, existing)
    expect(match.lead.id).toBe('L-10003')
    expect(match.confidence).toBe('medium')
    expect(match.matchedOn).toEqual(['whatsapp'])
  })

  it("matches a phone number against another lead's WhatsApp number", () => {
    const [match] = findDuplicates({ phone: '+91 98111 22233' }, existing)
    expect(match.lead.id).toBe('L-10003')
    expect(match.confidence).toBe('high')
  })

  it('treats a company-only match as low confidence', () => {
    const [match] = findDuplicates({ company: 'joshi foods' }, existing)
    expect(match.lead.id).toBe('L-10004')
    expect(match.confidence).toBe('low')
  })

  it('ignores archived leads and the lead itself', () => {
    const ids = findDuplicates({ id: 'L-10001', phone: '+919876543210' }, existing).map(
      (m) => m.lead.id,
    )
    expect(ids).toEqual([])
  })

  it('returns nothing for a non-match or empty probe', () => {
    expect(findDuplicates({ phone: '+919000000000' }, existing)).toEqual([])
    expect(findDuplicates({}, existing)).toEqual([])
  })

  it('ranks by confidence, then by number of matching fields, then oldest first', () => {
    const matches = findDuplicates(
      { phone: '+919876543210', email: 'sunita@rao.in', company: 'Joshi Foods' },
      existing,
    )
    expect(matches.map((m) => m.lead.id)).toEqual(['L-10001', 'L-10002', 'L-10004'])
  })

  it('exposes only summary fields', () => {
    const [match] = findDuplicates({ phone: '+919876543210' }, existing)
    expect(Object.keys(match.lead).sort()).toEqual(
      ['assignedTo', 'company', 'createdAt', 'email', 'id', 'name', 'phone', 'statusId'].sort(),
    )
  })
})

describe('compareContacts', () => {
  it('reports every matching field', () => {
    const pair = compareContacts(
      { phone: '+919876543210', email: 'a@b.in', company: 'Acme Ltd' },
      { phone: '9876543210', email: 'A@B.IN', company: 'ACME' },
    )
    expect(pair?.matchedOn).toEqual(['phone', 'email', 'company'])
    expect(pair?.confidence).toBe('high')
  })
})

describe('groupDuplicates', () => {
  it('clusters leads linked by phone or email and skips company-only links', () => {
    const leads = [
      makeLead({ id: 'L-10001', phone: '+919876543210', createdAt: '2026-08-01T00:00:00Z' }),
      makeLead({
        id: 'L-10002',
        phone: '+919876543210',
        email: 'x@y.in',
        createdAt: '2026-08-02T00:00:00Z',
      }),
      makeLead({ id: 'L-10003', email: 'x@y.in', createdAt: '2026-08-03T00:00:00Z' }),
      makeLead({ id: 'L-10004', company: 'Acme', createdAt: '2026-08-04T00:00:00Z' }),
      makeLead({ id: 'L-10005', company: 'Acme Pvt Ltd', createdAt: '2026-08-05T00:00:00Z' }),
      makeLead({ id: 'L-10006', phone: '+919000000001' }),
    ]
    const groups = groupDuplicates(leads)
    expect(groups).toHaveLength(1)
    expect(groups[0].leads.map((l) => l.id)).toEqual(['L-10001', 'L-10002', 'L-10003'])
    expect(groups[0].confidence).toBe('high')
    expect(groups[0].key).toBe('L-10001+L-10002+L-10003')
  })
})
