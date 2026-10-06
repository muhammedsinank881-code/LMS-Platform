import { describe, expect, it } from 'vitest'
import { makeLead } from '@/test/factories'
import {
  TEXT_PREFIX,
  defaultVariableMap,
  renderBroadcastBody,
  validateVariableMap,
} from './broadcast-variables'

describe('variable mapping', () => {
  const variables = ['lead.name', 'offer']

  it('defaults known variables to their lead field and unknown ones to fixed text', () => {
    expect(defaultVariableMap(variables)).toEqual({ 'lead.name': 'lead.name', offer: TEXT_PREFIX })
  })

  it('requires every variable to be mapped to a real field or non-empty text', () => {
    expect(validateVariableMap(variables, { 'lead.name': 'lead.name', offer: `${TEXT_PREFIX}20% off` })).toEqual({})
    const errors = validateVariableMap(variables, { 'lead.name': 'lead.bogus', offer: TEXT_PREFIX })
    expect(Object.keys(errors).sort()).toEqual(['lead.name', 'offer'])
    expect(validateVariableMap(variables, {})).toHaveProperty('lead.name')
  })

  it('accepts a custom field only when the workspace has it', () => {
    const map = { 'lead.custom.city': 'lead.custom.city' }
    expect(validateVariableMap(['lead.custom.city'], map, ['city'])).toEqual({})
    expect(validateVariableMap(['lead.custom.city'], map, [])).toHaveProperty(['lead.custom.city'])
  })

  it('renders per lead and flags values that cannot be resolved', () => {
    const lead = makeLead({ name: 'Riya Shah', company: null })
    const body = 'Hi {{lead.name}}, enjoy {{offer}} at {{lead.company}}.'
    const result = renderBroadcastBody(
      body,
      { 'lead.name': 'lead.name', offer: `${TEXT_PREFIX}20% off`, 'lead.company': 'lead.company' },
      { lead },
    )
    expect(result.text).toBe('Hi Riya Shah, enjoy 20% off at .')
    expect(result.missing).toEqual(['lead.company'])
  })
})
