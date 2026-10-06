import { cn } from '@/lib/cn'
import type { PipelineStage } from '@/types'

export function StageTabStrip({
  stages,
  activeId,
  onSelect,
}: {
  stages: PipelineStage[]
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="mb-2 flex gap-1 overflow-x-auto pb-1 lg:hidden" role="tablist" aria-label="Pipeline stages">
      {stages.map((stage) => {
        const selected = stage.id === activeId
        return (
          <button
            key={stage.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              'min-h-11 shrink-0 rounded-full border px-3 text-sm',
              selected ? 'border-primary bg-primary/10 font-medium text-foreground' : 'border-border text-muted-foreground',
            )}
            onClick={() => onSelect(stage.id)}
          >
            {stage.name}
          </button>
        )
      })}
    </div>
  )
}
