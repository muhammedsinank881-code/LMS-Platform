import { describe, expect, it } from 'vitest'
import { htmlToText, looksLikeHtml, sanitizeEmailHtml } from './sanitize-html'

describe('sanitizeEmailHtml', () => {
  it('keeps basic formatting and safe links', () => {
    const html = sanitizeEmailHtml('<p>Hi <b>there</b> <i>friend</i></p><ul><li>One</li></ul><a href="https://example.com">site</a>')
    expect(html).toContain('<b>there</b>')
    expect(html).toContain('<li>One</li>')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('strips scripts, event handlers and styles', () => {
    const html = sanitizeEmailHtml('<p onclick="steal()">Hello</p><script>alert(1)</script><style>body{}</style><img src=x onerror=alert(1)>')
    expect(html).not.toMatch(/script|onclick|onerror|<img|<style/i)
    expect(html).toContain('Hello')
  })

  it('drops javascript: links but keeps their text', () => {
    const html = sanitizeEmailHtml('<a href="javascript:alert(1)">click</a>')
    expect(html).not.toContain('javascript:')
    expect(html).toContain('click')
  })

  it('escapes plain text and keeps its line breaks', () => {
    expect(sanitizeEmailHtml('1 < 2 & 3\nnext line')).toBe('1 &lt; 2 &amp; 3<br>next line')
  })
})

describe('htmlToText', () => {
  it('turns markup into readable text', () => {
    expect(htmlToText('<p>Hello&nbsp;<b>world</b></p><p>Bye</p>')).toBe('Hello world\nBye')
  })
})

describe('looksLikeHtml', () => {
  it('tells markup from text containing angle brackets', () => {
    expect(looksLikeHtml('<b>x</b>')).toBe(true)
    expect(looksLikeHtml('a < b and c > d')).toBe(false)
  })
})
