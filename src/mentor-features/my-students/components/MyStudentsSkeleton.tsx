export function MyStudentsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1 max-w-lg" />
        <div className="hidden sm:flex gap-2">
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* Table / Cards Skeleton */}
      <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-lg flex items-center justify-between px-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-1">
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded hidden sm:block" />
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded hidden sm:block" />
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
