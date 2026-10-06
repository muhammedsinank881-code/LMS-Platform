import { describe, expect, it } from 'vitest'
import { escapeCsvField, serializeCsv, serializeCsvRow } from './csv'

describe('escapeCsvField', () => {
  it('leaves plain text alone', () => {
    expect(escapeCsvField('Ananya')).toBe('Ananya')
    expect(escapeCsvField(42)).toBe('42')
    expect(escapeCsvField(null)).toBe('')
  })

  it('quotes commas, quotes and newlines', () => {
    expect(escapeCsvField('Delhi, India')).toBe('"Delhi, India"')
    expect(escapeCsvField('He said "hi"')).toBe('"He said ""hi"""')
    expect(escapeCsvField('line1\nline2')).toBe('"line1\nline2"')
  })
})

describe('serializeCsv', () => {
  it('joins rows with CRLF and escapes cells', () => {
    const csv = serializeCsv(['Name', 'City'], [['Riya', 'Mumbai, MH'], ['A "pro"', 'Pune']])
    expect(csv).toBe('Name,City\r\nRiya,"Mumbai, MH"\r\n"A ""pro""",Pune')
  })

  it('serializes a single row', () => {
    expect(serializeCsvRow(['a', 'b,c'])).toBe('a,"b,c"')
  })
})
