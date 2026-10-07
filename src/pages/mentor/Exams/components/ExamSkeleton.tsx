import { Skeleton } from '@/components/ui'

export function ExamSkeleton() {
  return (
    <div className="space-y-5">
      {/* Overview Skeleton */}
      <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl p-5 space-y-3 shadow-2xs">
        <Skeleton className="h-4 w-28 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`skel-ov-${idx}`} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-7 w-10 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Exam Cards List Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`skel-card-${idx}`}
            className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl p-5 space-y-4 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-5 w-2/3 rounded-md" />
                <Skeleton className="h-3.5 w-1/3 rounded-md" />
              </div>
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <div className="pt-3 border-t border-[#E2E8F0] dark:border-border flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="size-5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
