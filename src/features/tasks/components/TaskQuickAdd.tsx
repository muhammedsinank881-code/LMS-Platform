import { useState } from 'react'
import { Input } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'

export function TaskQuickAdd({ onCreate, disabled }: { onCreate: (title: string) => Promise<void>; disabled?: boolean }) {
  const { can } = usePermission()
  const [title, setTitle] = useState('')
  if (!can('tasks', 'create')) return null
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        const field = event.currentTarget.elements.namedItem('task-quick-add')
        const raw = field instanceof HTMLInputElement ? field.value : title
        const next = raw.trim()
        if (next.length < 2) return
        await onCreate(next)
        setTitle('')
      }}
    >
      <Input
        name="task-quick-add"
        value={title}
        disabled={disabled}
        placeholder="Add a task…"
        aria-label="Add a task"
        onChange={(event) => setTitle(event.target.value)}
      />
    </form>
  )
}
