import { ProgressBar } from '@/components/ui'

/** Shown while the first lazy route chunk loads (router `HydrateFallback`). */
export function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-8">
      <div className="w-48" role="status" aria-live="polite">
        <ProgressBar value={null} size="sm" aria-label="Loading LeadFlow" />
      </div>
    </div>
  )
}
