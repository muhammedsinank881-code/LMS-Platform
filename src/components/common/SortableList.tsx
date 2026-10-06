import { useState, type ReactNode } from 'react'
import { LiveStatus } from '@/components/common/LiveStatus'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { orderByIds, reorderIds } from '@/lib/settings/reorder'
import { cn } from '@/lib/cn'

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  disabled = false,
  label = 'Reorder list',
}: {
  items: T[]
  onReorder: (orderedIds: string[]) => Promise<unknown> | void
  renderItem: (item: T) => ReactNode
  disabled?: boolean
  label?: string
}) {
  const signature = items.map((item) => item.id).join('\0')
  const [order, setOrder] = useState<{ signature: string; ids: string[] } | null>(null)
  const shown = order?.signature === signature ? orderByIds(items, order.ids) : items
  const [dragStatus, setDragStatus] = useState('')
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragStart = (event: DragStartEvent) => {
    setDragStatus(`Picked up an item in ${label}. Use the arrow keys to move it, then Space to drop.`)
    void event
  }

  const onDragEnd = async (event: DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id) {
      setDragStatus('Drop cancelled.')
      return
    }
    setDragStatus(`Dropped an item in ${label}.`)
    const previous = shown.map((item) => item.id)
    const next = reorderIds(previous, String(event.active.id), String(event.over.id))
    setOrder({ signature, ids: next })
    try {
      await onReorder(next)
    } catch {
      setOrder({ signature, ids: previous })
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <LiveStatus message={dragStatus} />
      <SortableContext items={shown.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2" aria-label={label}>
          {shown.map((item) => (
            <SortableRow key={item.id} id={item.id} disabled={disabled}>
              {renderItem(item)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({
  id,
  disabled,
  children,
}: {
  id: string
  disabled: boolean
  children: ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 rounded-md border border-border bg-surface p-2',
        isDragging && 'opacity-70',
      )}
    >
      <button
        type="button"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 sm:h-8 sm:w-8"
        aria-label="Drag to reorder"
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  )
}
