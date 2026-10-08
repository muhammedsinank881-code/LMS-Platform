import { Skeleton } from '@/components/ui'

export function ClassSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={`skel-${idx}`}
          className="bg-surface border border-border rounded-md p-5 space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-3.5 w-20 rounded-md" />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

