import { useEffect, useState, type RefObject } from 'react'

/** Tracks the column snapped nearest the left edge, and resets when the pipeline changes. */
export function useActiveStage(
  scrollerRef: RefObject<HTMLDivElement | null>,
  fallbackId: string,
  ready: boolean,
) {
  const [state, setState] = useState<{ fallbackId: string; picked: string | null }>({
    fallbackId,
    picked: null,
  })
  if (state.fallbackId !== fallbackId) {
    setState({ fallbackId, picked: null })
  }
  const activeId = state.picked ?? fallbackId

  useEffect(() => {
    const root = scrollerRef.current
    if (!ready || !root) return
    const onScroll = () => {
      const left = root.getBoundingClientRect().left
      let bestId = ''
      let best = Number.POSITIVE_INFINITY
      for (const node of root.querySelectorAll<HTMLElement>('[data-stage-id]')) {
        const distance = Math.abs(node.getBoundingClientRect().left - left)
        const id = node.dataset.stageId
        if (id && distance < best) {
          best = distance
          bestId = id
        }
      }
      if (bestId) setState((current) => ({ ...current, picked: bestId }))
    }
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [ready, scrollerRef])

  return [activeId, (id: string) => setState((current) => ({ ...current, picked: id }))] as const
}
