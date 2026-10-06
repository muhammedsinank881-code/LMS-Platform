import { Rows2, Rows3 } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { TableDensity } from './types'

export interface DensityToggleProps {
  density: TableDensity
  onDensityChange: (density: TableDensity) => void
}

export function DensityToggle({ density, onDensityChange }: DensityToggleProps) {
  const compact = density === 'compact'
  return (
    <Button
      variant="outline"
      size="sm"
      aria-pressed={compact}
      aria-label={compact ? 'Use comfortable density' : 'Use compact density'}
      onClick={() => onDensityChange(compact ? 'comfortable' : 'compact')}
    >
      {compact ? <Rows3 /> : <Rows2 />}
      <span className={cn('hidden sm:inline')}>{compact ? 'Compact' : 'Comfortable'}</span>
    </Button>
  )
}
