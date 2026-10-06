import { describe, expect, it } from 'vitest'
import { buildLeadInput } from './build-input'
import { applyFieldMapping, parseBudget, rawFromPayload } from './field-mapping'
import { pickRoundRobin } from './round-robin'
import { captureUtm, matchCampaign } from './utm'

const defaults = { sourceId: 'src-1', campaignId: null, statusId: null, tags: ['ads'], assignMode: 'rules' as const, assignUserId: null }

describe('rawFromPayload', () => {
  it('flattens every provider shape to question -> answer', () => {
    expect(rawFromPayload({ shape: 'meta', formId: 'f', fieldData: [{ name: 'full_name', values: ['Asha', 'K'] }] })).toEqual({ full_name: 'Asha, K' })
    expect(rawFromPayload({ shape: 'google', formId: 'f', userColumnData: [{ columnId: 'EMAIL', stringValue: 'a@b.co' }] })).toEqual({ EMAIL: 'a@b.co' })
    expect(rawFromPayload({ shape: 'linkedin', formId: 'f', answers: [{ question: 'Company', answer: 'Zed' }] })).toEqual({ Company: 'Zed' })
    expect(rawFromPayload({ shape: 'whatsapp', from: '+919876543210', text: 'Hi' })).toMatchObject({ phone: '+919876543210', whatsapp: '+919876543210', requirement: 'Hi' })
    expect(rawFromPayload({ shape: 'api', data: { name: 'X', phone: null, budget: 5 } })).toEqual({ name: 'X', budget: '5' })
  })
})

describe('applyFieldMapping', () => {
  it('maps standard and custom fields, case-insensitively', () => {
    const mapped = applyFieldMapping(
      { Full_Name: 'Asha', Phone_Number: '98765 43210', Size: '12', Interested: 'a, b' },
      [
        { sourceField: 'full_name', leadField: 'name' },
        { sourceField: 'phone_number', leadField: 'phone' },
        { sourceField: 'size', leadField: 'custom.company_size' },
        { sourceField: 'interested', leadField: 'custom.interested_services' },
      ],
      [
        { key: 'company_size', type: 'number' },
        { key: 'interested_services', type: 'multiselect' },
      ],
    )
    expect(mapped.standard).toEqual({ name: 'Asha', phone: '98765 43210' })
    expect(mapped.custom).toEqual({ company_size: 12, interested_services: ['a', 'b'] })
    expect(mapped.unmapped).toEqual([])
  })

  it('keeps known field names, reports unknown questions, skips blanks, first answer wins', () => {
    const mapped = applyFieldMapping({ email: 'a@b.co', favourite_colour: 'blue', name: '  ', alt: 'Second' }, [{ sourceField: 'alt', leadField: 'email' }])
    expect(mapped.standard).toEqual({ email: 'a@b.co' })
    expect(mapped.unmapped).toEqual(['favourite_colour'])
  })
})

describe('buildLeadInput', () => {
  it('applies defaults, parses budget and falls back to a name', () => {
    const mapped = applyFieldMapping({ phone: '+919876543210', budget: '₹1,50,000' }, [])
    const input = buildLeadInput(mapped, defaults)
    expect(input).toMatchObject({ name: '+919876543210', sourceId: 'src-1', tags: ['ads'], budget: 150000, assignedTo: undefined })
  })

  it('assigns a specific user only in that mode and lets a matched campaign win', () => {
    const mapped = applyFieldMapping({ name: 'Asha', email: 'a@b.co' }, [])
    const input = buildLeadInput(mapped, { ...defaults, campaignId: 'c-default', assignMode: 'specific_user', assignUserId: 'u1' }, { campaignId: 'c-utm' })
    expect(input).toMatchObject({ assignedTo: 'u1', campaignId: 'c-utm' })
  })

  it('parseBudget rejects junk', () => {
    expect(parseBudget('abc')).toBeNull()
    expect(parseBudget(undefined)).toBeNull()
  })
})

describe('captureUtm and matchCampaign', () => {
  it('reads utm_* from a query string and trims', () => {
    expect(captureUtm('?utm_source=google&utm_medium=cpc&utm_campaign= Diwali Sale &foo=1&utm_term=')).toEqual({ source: 'google', medium: 'cpc', campaign: 'Diwali Sale' })
  })

  const campaigns = [
    { id: 'c1', name: 'Diwali Dhamaka: Search', archivedAt: null },
    { id: 'c2', name: 'Old promo', archivedAt: '2026-01-01' },
  ]
  it('matches by id or by a name ignoring case and punctuation, never archived', () => {
    expect(matchCampaign({ campaign: 'c1' }, campaigns)).toBe('c1')
    expect(matchCampaign({ campaign: 'diwali-dhamaka-search' }, campaigns)).toBe('c1')
    expect(matchCampaign({ campaign: 'DIWALI DHAMAKA SEARCH' }, campaigns)).toBe('c1')
    expect(matchCampaign({ campaign: 'old-promo' }, campaigns)).toBeNull()
    expect(matchCampaign({}, campaigns)).toBeNull()
  })
})

describe('pickRoundRobin', () => {
  const users = [
    { id: 'a', role: 'salesperson' as const, status: 'active' as const },
    { id: 'b', role: 'salesperson' as const, status: 'active' as const },
    { id: 'm', role: 'manager' as const, status: 'active' as const },
  ]
  it('picks the seller assigned longest ago and skips non-sellers', () => {
    expect(pickRoundRobin(users, [])).toBe('a')
    expect(pickRoundRobin(users, [{ assignedTo: 'a', assignedAt: '2026-10-01' }])).toBe('b')
    expect(pickRoundRobin(users, [{ assignedTo: 'a', assignedAt: '2026-10-01' }, { assignedTo: 'b', assignedAt: '2026-10-02' }])).toBe('a')
  })
})
