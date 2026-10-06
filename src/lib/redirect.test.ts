import { describe, expect, it } from 'vitest'
import { buildLoginUrl, getSafeRedirect } from './redirect'

describe('getSafeRedirect', () => {
  it('keeps in-app paths, including query strings', () => {
    expect(getSafeRedirect('/leads?status=hot')).toBe('/leads?status=hot')
  })

  it.each(['//evil.com', 'https://evil.com', '/\\evil.com', 'leads', '', null, undefined])(
    'falls back for unsafe value %s',
    (value) => {
      expect(getSafeRedirect(value)).toBe('/dashboard')
    },
  )

  it('never redirects back to an auth screen', () => {
    expect(getSafeRedirect('/login?redirect=/leads')).toBe('/dashboard')
    expect(getSafeRedirect('/register')).toBe('/dashboard')
  })

  it('uses the supplied fallback', () => {
    expect(getSafeRedirect(null, '/onboarding')).toBe('/onboarding')
  })
})

describe('buildLoginUrl', () => {
  it('encodes the return path', () => {
    expect(buildLoginUrl('/leads?status=hot')).toBe('/login?redirect=%2Fleads%3Fstatus%3Dhot')
  })

  it('omits the param when there is nothing meaningful to return to', () => {
    expect(buildLoginUrl()).toBe('/login')
    expect(buildLoginUrl('/')).toBe('/login')
    expect(buildLoginUrl('/dashboard')).toBe('/login')
  })
})
