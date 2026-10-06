import { describe, expect, it } from 'vitest'
import { makeLead } from '@/test/factories'
import { mergeLeads } from './merge-leads'

const primary = makeLead({
  id: 'L-10001',
  name: 'Amit Kumar',
  phone: '+919876543210',
  email: null,
  company: 'Kumar Foods',
  budget: 50_000,
  tags: ['vip'],
  customFields: { gst: 'GST-1', city: 'Pune' },
  qualificationAnswers: { q1: 'yes' },
  createdAt: '2026-08-10T00:00:00.000Z',
  lastContactedAt: '2026-09-01T00:00:00.000Z',
  nextFollowUpAt: '2026-10-10T00:00:00.000Z',
  firstResponseTimeMins: 45,
})

const secondary = makeLead({
  id: 'L-10002',
  name: 'Amit K.',
  phone: '+919000000001',
  email: 'amit@kumarfoods.in',
  company: 'Kumar Foods Pvt Ltd',
  budget: 90_000,
  tags: ['vip', 'referral'],
  customFields: { gst: 'GST-2', pan: 'PAN-1' },
  qualificationAnswers: { q1: 'no', q2: 'maybe' },
  createdAt: '2026-08-01T00:00:00.000Z',
  lastContactedAt: '2026-09-05T00:00:00.000Z',
  nextFollowUpAt: '2026-10-08T00:00:00.000Z',
  firstResponseTimeMins: 20,
})

describe('mergeLeads', () => {
  it('keeps the primary id and defaults to primary values', () => {
    const merged = mergeLeads(primary, secondary)
    expect(merged.id).toBe('L-10001')
    expect(merged.name).toBe('Amit Kumar')
    expect(merged.phone).toBe('+919876543210')
    expect(merged.budget).toBe(50_000)
  })

  it('fills blanks in the primary from the secondary when no choice is made', () => {
    expect(mergeLeads(primary, secondary).email).toBe('amit@kumarfoods.in')
  })

  it('honours explicit field choices, including choosing a blank over a value', () => {
    const merged = mergeLeads(primary, secondary, {
      name: 'secondary',
      budget: 'secondary',
      phone: 'primary',
      email: 'primary',
    })
    expect(merged.name).toBe('Amit K.')
    expect(merged.budget).toBe(90_000)
    expect(merged.phone).toBe('+919876543210')
    expect(merged.email).toBeNull()
  })

  it('unions tags and merges custom fields and answers with the primary winning ties', () => {
    const merged = mergeLeads(primary, secondary)
    expect(merged.tags).toEqual(['vip', 'referral'])
    expect(merged.customFields).toEqual({ gst: 'GST-1', city: 'Pune', pan: 'PAN-1' })
    expect(merged.qualificationAnswers).toEqual({ q1: 'yes', q2: 'maybe' })
  })

  it('keeps the earliest creation, latest contact, earliest follow-up and fastest response', () => {
    const merged = mergeLeads(primary, secondary)
    expect(merged.createdAt).toBe('2026-08-01T00:00:00.000Z')
    expect(merged.lastContactedAt).toBe('2026-09-05T00:00:00.000Z')
    expect(merged.nextFollowUpAt).toBe('2026-10-08T00:00:00.000Z')
    expect(merged.firstResponseTimeMins).toBe(20)
  })

  it('handles missing history values on one side', () => {
    const merged = mergeLeads(
      makeLead({ lastContactedAt: null, nextFollowUpAt: null, firstResponseTimeMins: null }),
      primary,
    )
    expect(merged.lastContactedAt).toBe(primary.lastContactedAt)
    expect(merged.nextFollowUpAt).toBe(primary.nextFollowUpAt)
    expect(merged.firstResponseTimeMins).toBe(45)
  })

  it('carries over a conversion and clears duplicate flags', () => {
    const merged = mergeLeads(
      makeLead({ duplicateOf: 'L-10009' }),
      makeLead({ id: 'L-10002', convertedToCustomerId: 'C-1001' }),
    )
    expect(merged.convertedToCustomerId).toBe('C-1001')
    expect(merged.duplicateOf).toBeNull()
  })

  it('does not mutate its inputs', () => {
    const before = JSON.stringify([primary, secondary])
    mergeLeads(primary, secondary, { name: 'secondary' })
    expect(JSON.stringify([primary, secondary])).toBe(before)
  })
})
