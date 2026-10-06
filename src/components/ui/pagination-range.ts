export type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Page numbers to render, with ellipses. Always keeps the first and last page, the current
 * page and `siblingCount` neighbours each side. The slot count stays constant so the control
 * does not jump while paging.
 */
export function getPageRange(page: number, pageCount: number, siblingCount = 1): PageItem[] {
  if (pageCount <= 0) return []

  const current = Math.min(Math.max(page, 1), pageCount)
  const totalSlots = siblingCount * 2 + 5 // first + last + current + two ellipses
  if (pageCount <= totalSlots) return range(1, pageCount)

  const left = Math.max(current - siblingCount, 1)
  const right = Math.min(current + siblingCount, pageCount)
  const showLeftEllipsis = left > 3
  const showRightEllipsis = right < pageCount - 2
  const edgeCount = 3 + siblingCount * 2

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, edgeCount), 'ellipsis-end', pageCount]
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, 'ellipsis-start', ...range(pageCount - edgeCount + 1, pageCount)]
  }
  return [1, 'ellipsis-start', ...range(left, right), 'ellipsis-end', pageCount]
}
