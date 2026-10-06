import { Lock } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * How a stored secret is shown everywhere: bullets and the last four characters, announced as
 * "ending in 1234" so a screen reader never reads out bullet characters.
 */
export function SecretField({ masked, label = 'Secret', className }: { masked: string; label?: string; className?: string }) {
  const tail = masked.replace(/[^A-Za-z0-9]/g, '').slice(-4)
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground', className)}>
      <Lock aria-hidden="true" className="h-3 w-3 text-muted-foreground" />
      <span aria-hidden="true">{masked || '••••••••'}</span>
      <span className="sr-only">{tail ? `${label} ending in ${tail.split('').join(' ')}` : `${label} is hidden`}</span>
    </span>
  )
}
