import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins class names and skips falsy values', () => {
    const isHidden = false
    expect(cn('px-2', isHidden && 'hidden', undefined, null, 'py-1')).toBe('px-2 py-1')
  })

  it('supports object and array syntax', () => {
    expect(cn(['font-medium'], { 'text-primary': true, 'text-muted': false })).toBe(
      'font-medium text-primary',
    )
  })

  it('resolves conflicting Tailwind classes, last one wins', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    expect(cn('bg-primary', 'bg-destructive')).toBe('bg-destructive')
  })
})
