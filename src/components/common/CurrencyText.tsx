import { formatCurrency } from '@/lib/format'
import { EMPTY_VALUE } from '@/lib/format/shared'

export interface CurrencyTextProps {
  amount: number | null | undefined
  compact?: boolean
  currency?: string
  className?: string
}

export function CurrencyText({ amount, compact, currency = 'INR', className }: CurrencyTextProps) {
  if (amount === null || amount === undefined) {
    return <span className={className}>{EMPTY_VALUE}</span>
  }
  return <span className={className}>{formatCurrency(amount, { currency, compact })}</span>
}
