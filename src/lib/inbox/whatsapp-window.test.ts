import { describe, expect, it } from 'vitest'
import { getWhatsAppWindow, windowExpiresAtFrom, WHATSAPP_WINDOW_MS } from './whatsapp-window'

const NOW = new Date('2026-10-04T12:00:00.000Z')

describe('getWhatsAppWindow', () => {
  it('is expired when there is no window', () => {
    const window = getWhatsAppWindow(null, NOW)
    expect(window.state).toBe('expired')
    expect(window.canFreeText).toBe(false)
  })

  it('is open when more than an hour remains', () => {
    const expires = new Date(NOW.getTime() + 5 * 3_600_000).toISOString()
    const window = getWhatsAppWindow(expires, NOW)
    expect(window.state).toBe('open')
    expect(window.canFreeText).toBe(true)
    expect(window.label).toContain('5h')
  })

  it('is closing soon when under an hour remains', () => {
    const expires = new Date(NOW.getTime() + 25 * 60_000).toISOString()
    const window = getWhatsAppWindow(expires, NOW)
    expect(window.state).toBe('closing_soon')
    expect(window.canFreeText).toBe(true)
    expect(window.label).toContain('25m')
  })

  it('is expired after the deadline and labels how long ago', () => {
    const expires = new Date(NOW.getTime() - 3 * 3_600_000).toISOString()
    const window = getWhatsAppWindow(expires, NOW)
    expect(window.state).toBe('expired')
    expect(window.canFreeText).toBe(false)
    expect(window.label).toBe('Expired 3h ago')
  })
})

describe('windowExpiresAtFrom', () => {
  it('adds 24 hours to the inbound timestamp', () => {
    const inbound = '2026-10-04T12:00:00.000Z'
    expect(Date.parse(windowExpiresAtFrom(inbound)) - Date.parse(inbound)).toBe(WHATSAPP_WINDOW_MS)
  })
})
