interface StatCardProps {
  label: string
  value: number
  colorClass: string
  bgClass?: string
  borderClass?: string
}

export function StatCard({
  label,
  value,
  colorClass,
  bgClass = 'bg-white dark:bg-card',
  borderClass = 'border-[#E5E7EB] dark:border-border',
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl ${bgClass} border ${borderClass} p-4 sm:p-5 text-center flex flex-col justify-center space-y-1 transition-all`}
    >
      <div className={`text-2xl sm:text-3xl font-extrabold ${colorClass} leading-tight`}>
        {value}
      </div>
      <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">
        {label}
      </div>
    </div>
  )
}
