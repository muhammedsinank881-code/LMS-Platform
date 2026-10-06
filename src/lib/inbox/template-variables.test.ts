import { describe, expect, it } from 'vitest'
import { makeLead, makeUser } from '@/test/factories'
import {
  isAllowedTemplateVariable,
  parseTemplateVariables,
  renderTemplate,
  templateEdgeVariableError,
  validateTemplateVariables,
} from './template-variables'

describe('parseTemplateVariables', () => {
  it('returns unique dotted placeholders in order', () => {
    expect(parseTemplateVariables('Hi {{lead.name}}, see {{lead.name}} at {{company.name}}')).toEqual(['lead.name', 'company.name'])
  })

  it('ignores malformed placeholders', () => {
    expect(parseTemplateVariables('{{ spaced }} {single} {{1bad}} {{ok.one}}')).toEqual(['ok.one'])
  })
})

describe('validateTemplateVariables', () => {
  it('accepts the core variables', () => {
    expect(validateTemplateVariables('{{lead.name}} {{lead.company}} {{owner.name}} {{company.name}}').unknown).toEqual([])
  })

  it('rejects unknown variables', () => {
    expect(validateTemplateVariables('Hi {{lead.name}} {{unknown}}').unknown).toEqual(['unknown'])
  })

  it('accepts only custom fields that exist on the workspace', () => {
    expect(validateTemplateVariables('{{lead.custom.gst}}', ['gst']).unknown).toEqual([])
    expect(validateTemplateVariables('{{lead.custom.made_up}}', ['gst']).unknown).toEqual(['lead.custom.made_up'])
    expect(validateTemplateVariables('{{lead.custom.gst}}').unknown).toEqual(['lead.custom.gst'])
    expect(isAllowedTemplateVariable('lead.custom.', ['gst'])).toBe(false)
  })
})

describe('renderTemplate', () => {
  it('fills lead, owner, company and custom field values', () => {
    const lead = makeLead({ name: 'Riya Shah', company: 'Shah Traders', customFields: { gst: '27AAAAA0000A1Z5' } })
    const result = renderTemplate('Hi {{lead.name}} of {{lead.company}}. GST {{lead.custom.gst}}. {{owner.name}} at {{company.name}}.', {
      lead,
      owner: makeUser({ name: 'Ananya' }),
      companyName: 'Acme Digital',
    })
    expect(result.text).toBe('Hi Riya Shah of Shah Traders. GST 27AAAAA0000A1Z5. Ananya at Acme Digital.')
    expect(result.missing).toEqual([])
  })

  it('{{company.name}} is the sender\'s workspace, never the lead\'s company', () => {
    const result = renderTemplate('From {{company.name}}', { lead: makeLead({ company: 'Shah Traders' }), companyName: 'Acme Digital' })
    expect(result.text).toBe('From Acme Digital')
  })

  it('leaves missing values blank and lists each once', () => {
    const result = renderTemplate('Hi {{lead.name}}, {{lead.company}} / {{lead.company}} / {{owner.name}}', {
      lead: makeLead({ name: 'Riya', company: null }),
    })
    expect(result.text).toBe('Hi Riya,  /  / ')
    expect(result.missing).toEqual(['lead.company', 'owner.name'])
  })

  it('treats an empty custom field as missing', () => {
    const result = renderTemplate('{{lead.custom.gst}}', { lead: makeLead({ customFields: { gst: '' } }) })
    expect(result.missing).toEqual(['lead.custom.gst'])
  })

  it('uses typed or sample values over lead data, and counts them as filled', () => {
    const result = renderTemplate('Hi {{lead.name}}', { lead: makeLead({ name: 'Riya' }), fallbacks: { 'lead.name': 'there' } })
    expect(result.text).toBe('Hi there')
    expect(result.missing).toEqual([])
    const blank = renderTemplate('Hi {{lead.name}}', { lead: makeLead({ name: '' }), fallbacks: { 'lead.name': 'there' } })
    expect(blank.text).toBe('Hi there')
  })

  it('renders without a lead at all', () => {
    expect(renderTemplate('Hi {{lead.name}}', {}).missing).toEqual(['lead.name'])
  })
})

describe('templateEdgeVariableError', () => {
  it('flags a body that starts or ends with a variable', () => {
    expect(templateEdgeVariableError('{{lead.name}}, hello')).toMatch(/start or end/)
    expect(templateEdgeVariableError('Hello {{lead.name}}')).toMatch(/start or end/)
    expect(templateEdgeVariableError('Hello {{lead.name}}.')).toMatch(/start or end/)
  })

  it('accepts a variable in the middle', () => {
    expect(templateEdgeVariableError('Hello {{lead.name}}, thanks for calling')).toBeNull()
  })
})
