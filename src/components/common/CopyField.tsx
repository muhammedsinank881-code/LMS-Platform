import { useId } from 'react'
import { Input, Label } from '@/components/ui'
import { cn } from '@/lib/cn'
import { CopyButton } from './CopyButton'

/** A read-only value (URL, token, snippet) with its label and a copy button. */
export function CopyField({
  label,
  value,
  hint,
  multiline = false,
  className,
}: {
  label: string
  value: string
  hint?: string
  multiline?: boolean
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn('space-y-1', className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-start gap-2">
        {multiline ? (
          <textarea
            id={id}
            readOnly
            rows={5}
            value={value}
            onFocus={(event) => event.currentTarget.select()}
            className="min-h-24 w-full flex-1 resize-y rounded-md border border-input bg-muted p-3 font-mono text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <Input id={id} readOnly value={value} className="font-mono text-xs" onFocus={(event) => event.currentTarget.select()} />
        )}
        <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} iconOnly size="md" />
      </div>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
