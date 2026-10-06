import { lazy, Suspense, type ReactNode } from 'react'
import { Skeleton } from '@/components/ui'

const Loaded = lazy(() => import('./SortableList').then((mod) => ({ default: mod.SortableList })))

interface SortableListProps<T extends { id: string }> {
  items: T[]
  onReorder: (orderedIds: string[]) => Promise<unknown> | void
  renderItem: (item: T) => ReactNode
  disabled?: boolean
  label?: string
}

/** Loads the drag-and-drop list on first use, so settings pages do not ship it up front. */
export function SortableList<T extends { id: string }>(props: SortableListProps<T>) {
  return (
    <Suspense
      fallback={
        <div role="status" aria-label="Loading">
          <Skeleton className="h-24 w-full" />
        </div>
      }
    >
      <Loaded {...(props as unknown as SortableListProps<{ id: string }>)} />
    </Suspense>
  )
}
