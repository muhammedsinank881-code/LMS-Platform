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
    <Card className="p-4 sm:p-5 text-center flex flex-col justify-center space-y-1">
      <div className={`text-xl sm:text-2xl font-semibold tracking-tight leading-tight ${textColor}`}>
        {value}
      </div>
      <div className="text-xs font-medium text-muted-foreground">
        {label}
      </div>
    </Card>
  )
}

