import { Card, Skeleton } from '@/components/ui'

export function ResultsSkeleton() {
  return (
    <div className="space-y-5">
      {/* Overview Skeleton */}
      <Card className="p-5 space-y-3">
        <Skeleton className="h-4 w-28 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`skel-ov-${idx}`} className="p-4 rounded-lg bg-muted space-y-2">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-7 w-12 rounded-md" />
            </div>
          ))}
        </div>
      </Card>

      {/* Table / Cards Skeleton */}
      <Card className="p-5 space-y-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={`skel-row-${idx}`} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/3 rounded-md" />
              <Skeleton className="h-3 w-1/4 rounded-md" />
            </div>
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        ))}
      </Card>
    </div>
  )
}
