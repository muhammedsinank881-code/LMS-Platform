import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: number
  tone?: 'success' | 'destructive' | 'warning' | 'neutral'
  colorClass?: string
  bgClass?: string
  borderClass?: string
}

export function StatCard({
  label,
  value,
  tone = 'neutral',
}: StatCardProps) {
  const textColor =
    tone === 'success'
      ? 'text-success'
      : tone === 'destructive'
      ? 'text-destructive'
      : tone === 'warning'
      ? 'text-warning'
      : 'text-foreground'

  return (
    <Card className="p-2.5 sm:p-5 text-center flex flex-col justify-center space-y-0.5 sm:space-y-1">
      <div className={`text-lg sm:text-2xl font-semibold tracking-tight leading-tight ${textColor}`}>
        {value}
      </div>
      <div className="text-[11px] sm:text-xs font-medium text-muted-foreground">
        {label}
      </div>
    </Card>
  )
}

