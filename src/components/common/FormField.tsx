import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { Label } from '@/components/ui'
import { cn } from '@/lib/cn'

export interface FieldControlProps {
  id: string
  invalid: boolean
  required?: boolean
  'aria-required'?: boolean
  'aria-describedby'?: string
}

export interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  /** Receives the ids/flags to spread onto the control so label, hint and error stay wired up. */
  children: (control: FieldControlProps) => ReactNode
}

/** Label + control + hint/error, with the accessibility wiring done once. */
export function FormField({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  const messageId = error || hint ? `${id}-message` : undefined
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children({
        id,
        invalid: Boolean(error),
        required: required || undefined,
        'aria-required': required || undefined,
        'aria-describedby': messageId,
      })}
      {error ? (
        <p id={messageId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export interface FormAlertProps {
  tone?: 'error' | 'success'
  title?: string
  children: ReactNode
  className?: string
}

/** Inline banner for form-level results (failed submit, "email sent"). */
export function FormAlert({ tone = 'error', title, children, className }: FormAlertProps) {
  const Icon = tone === 'error' ? CircleAlert : CircleCheck
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-md border p-3 text-sm',
        tone === 'error'
          ? 'border-destructive/30 bg-destructive/10'
          : 'border-success/30 bg-success/10',
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0',
          tone === 'error' ? 'text-destructive' : 'text-success',
        )}
      />
      <div className="space-y-0.5">
        {title ? <p className="font-medium text-foreground">{title}</p> : null}
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  )
}
