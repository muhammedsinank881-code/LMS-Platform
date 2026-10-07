import { Skeleton } from '@/components/ui'

export function ClassSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={`skel-${idx}`}
          className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl p-5 space-y-4 shadow-2xs"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="size-10 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0]/60 dark:border-border/50 flex items-center justify-between">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-3.5 w-20 rounded-md" />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-border flex items-center justify-between">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
