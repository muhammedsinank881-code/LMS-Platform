import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui'
import { SimulatorPanel } from './SimulatorPanel'

export function SimulatorFab() {
  const [open, setOpen] = useState(false)
  if (!import.meta.env.DEV) return null
  return (
    <>
      <Button
        type="button"
        size="icon"
        className="fixed right-2 top-1/2 z-40 -translate-y-1/2 opacity-70 shadow-modal hover:opacity-100 focus-visible:opacity-100 lg:bottom-6 lg:right-6 lg:top-auto lg:translate-y-0"
        aria-label="Open simulator"
        onClick={() => setOpen((value) => !value)}
      >
        <FlaskConical />
      </Button>
      {open ? <SimulatorPanel onClose={() => setOpen(false)} /> : null}
    </>
  )
}
