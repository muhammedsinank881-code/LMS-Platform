import { describe, expect, it } from 'vitest'
import { getPageRange } from './pagination-range'

describe('getPageRange', () => {
  it('returns nothing when there are no pages', () => {
    expect(getPageRange(1, 0)).toEqual([])
  })

  it('lists every page when they fit', () => {
    expect(getPageRange(1, 1)).toEqual([1])
    expect(getPageRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses the right side near the start', () => {
    expect(getPageRange(1, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 10])
    expect(getPageRange(4, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 10])
  })

  it('collapses both sides in the middle', () => {
    expect(getPageRange(5, 10)).toEqual([1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10])
  })

  it('collapses the left side near the end', () => {
    expect(getPageRange(7, 10)).toEqual([1, 'ellipsis-start', 6, 7, 8, 9, 10])
    expect(getPageRange(10, 10)).toEqual([1, 'ellipsis-start', 6, 7, 8, 9, 10])
  })

  it('clamps out-of-range pages', () => {
    expect(getPageRange(99, 10)).toEqual(getPageRange(10, 10))
    expect(getPageRange(-3, 10)).toEqual(getPageRange(1, 10))
  })

  it('honours a wider sibling count', () => {
    expect(getPageRange(10, 20, 2)).toEqual([
      1,
      'ellipsis-start',
      8,
      9,
      10,
      11,
      12,
      'ellipsis-end',
      20,
    ])
  })
})
