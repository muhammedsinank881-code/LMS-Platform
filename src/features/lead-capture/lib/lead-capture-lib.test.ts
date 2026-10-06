import { describe, expect, it } from 'vitest'
import { suggestMapping } from '@/features/integrations/lib/suggest'
import { validateSubmission } from '@/lib/lead-forms/validate'
import { defaultFormInput, embedSnippets, newField } from './form-draft'
import { inputTypeFor, leadFieldOptions } from './fields'
import { validateDraft } from './validate-draft'

describe('form draft helpers', () => {
  it('starts with a valid form', () => {
    expect(validateDraft(defaultFormInput('src-1'))).toEqual({})
  })

  it('reports problems against the part of the form they belong to', () => {
    const draft = { ...defaultFormInput(null), name: '', fields: defaultFormInput(null).fields.filter((f) => f.key !== 'phone' && f.key !== 'email') }
    const errors = validateDraft(draft)
    expect(errors.name).toBeTruthy()
    expect(errors.fields).toMatch(/phone, WhatsApp number or email/)
  })

  it('offers standard then custom lead fields and picks sensible input types', () => {
    const options = leadFieldOptions([{ key: 'company_size', label: 'Company size', entity: 'lead' }, { key: 'old', label: 'Old', entity: 'lead', archived: true }, { key: 'x', label: 'Deal only', entity: 'deal' }])
    expect(options.map((o) => o.value).slice(-1)).toEqual(['custom.company_size'])
    expect(options.some((o) => o.value === 'custom.old' || o.value === 'custom.x')).toBe(false)
    expect(inputTypeFor('phone')).toBe('tel')
    expect(inputTypeFor('budget')).toBe('number')
    expect(inputTypeFor('custom.company_size', [{ key: 'company_size', type: 'number' }])).toBe('number')
    expect(newField('name')).toMatchObject({ required: true, type: 'text', label: 'Full name' })
  })

  it('builds embeds that forward the page query string for UTM capture', () => {
    const { link, iframe, script } = embedSnippets('https://app.example.com', 'form-abc', 'Contact "us"')
    expect(link).toBe('https://app.example.com/f/form-abc')
    expect(iframe).toContain('src="https://app.example.com/f/form-abc"')
    expect(iframe).toContain('title="Contact &quot;us&quot;"')
    expect(script).toContain("'https://app.example.com/f/form-abc' + window.location.search")
  })
})

describe('validateSubmission', () => {
  const form = {
    consentText: 'I agree',
    fields: [
      { ...newField('name'), required: true },
      { ...newField('phone'), required: true },
      { ...newField('email'), required: false },
      { ...newField('budget'), validation: { min: 1000, max: 5000 } },
      { ...newField('productInterest'), type: 'select' as const, options: ['Kitchen', 'Wardrobe'] },
      { ...newField('company'), validation: { pattern: '^[A-Z]' } },
    ],
  }
  it('accepts a valid submission', () => {
    expect(validateSubmission(form, { name: 'Asha', phone: '98765 43210', budget: '2000', productInterest: 'Kitchen', company: 'Zed' }, true)).toEqual({})
  })
  it('flags each broken rule', () => {
    const errors = validateSubmission(form, { name: '', phone: '12', email: 'nope', budget: '10', productInterest: 'Sofa', company: 'zed' }, false)
    expect(Object.keys(errors).sort()).toEqual(['budget', 'company', 'consent', 'email', 'name', 'phone', 'productInterest'])
  })
  it('only requires consent when the form asks for it', () => {
    expect(validateSubmission({ ...form, consentText: null }, { name: 'A B', phone: '9876543210' }, false)).toEqual({})
  })
})

describe('suggestMapping', () => {
  it('guesses lead fields from question text, once each', () => {
    expect(suggestMapping(['full_name', 'phone_number', 'email', 'Work email', 'budget', 'favourite colour'])).toEqual([
      { sourceField: 'full_name', leadField: 'name' },
      { sourceField: 'phone_number', leadField: 'phone' },
      { sourceField: 'email', leadField: 'email' },
      { sourceField: 'budget', leadField: 'budget' },
    ])
  })
})
