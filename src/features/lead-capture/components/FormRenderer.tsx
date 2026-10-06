import { useId, type CSSProperties, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { LeadFormField, PublicLeadForm } from '@/types'

type Renderable = Pick<PublicLeadForm, 'name' | 'fields' | 'submitLabel' | 'consentText' | 'spamProtection' | 'style'>

export interface FormRendererProps {
  form: Renderable
  values: Record<string, string>
  errors: Record<string, string>
  consent: boolean
  onValue: (key: string, value: string) => void
  onConsent: (checked: boolean) => void
  onSubmit?: () => void
  /** The hidden honeypot value, only wired on the public page. */
  honeypot?: string
  onHoneypot?: (value: string) => void
  submitting?: boolean
  /** The preview shows the form but never submits. */
  preview?: boolean
  formError?: string
}

const BASE = 'w-full border bg-[var(--lf-bg)] px-3 py-2.5 text-base text-[var(--lf-fg)] placeholder:text-[var(--lf-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lf-accent)]'

function Control({ field, value, id, invalid, describedBy, rounded, onChange }: { field: LeadFormField; value: string; id: string; invalid: boolean; describedBy?: string; rounded: boolean; onChange: (value: string) => void }) {
  const className = cn(BASE, rounded ? 'rounded-lg' : 'rounded-none', invalid ? 'border-red-600' : 'border-[var(--lf-border)]')
  const shared = { id, 'aria-invalid': invalid || undefined, 'aria-describedby': describedBy, 'aria-required': field.required || undefined, className }
  if (field.type === 'textarea') return <textarea {...shared} rows={4} value={value} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
  if (field.type === 'select') {
    return (
      <select {...shared} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{field.placeholder || 'Choose…'}</option>
        {field.options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    )
  }
  return (
    <input
      {...shared}
      type={field.type}
      inputMode={field.type === 'tel' ? 'tel' : field.type === 'number' ? 'decimal' : undefined}
      autoComplete={field.key === 'name' ? 'name' : field.key === 'email' ? 'email' : field.type === 'tel' ? 'tel' : undefined}
      value={value}
      placeholder={field.placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

/**
 * The form a visitor sees. Shared by the builder preview and the public page so what you design
 * is exactly what gets published. Colours come from CSS variables set from the form's style, and
 * every control has a label, a described error and a 44px+ target.
 */
export function FormRenderer({ form, values, errors, consent, onValue, onConsent, onSubmit, honeypot, onHoneypot, submitting, preview, formError }: FormRendererProps) {
  const uid = useId()
  const dark = form.style.theme === 'dark'
  const style = {
    '--lf-accent': form.style.accent,
    '--lf-bg': dark ? '#111827' : '#ffffff',
    '--lf-fg': dark ? '#f9fafb' : '#111827',
    '--lf-muted': dark ? '#9ca3af' : '#6b7280',
    '--lf-border': dark ? '#374151' : '#d1d5db',
  } as CSSProperties
  const rounded = form.style.rounded

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!preview) onSubmit?.()
  }

  return (
    <form onSubmit={submit} noValidate style={style} aria-label={form.name} className={cn('space-y-4 bg-[var(--lf-bg)] p-5 text-[var(--lf-fg)] sm:p-6', rounded ? 'rounded-xl' : 'rounded-none')}>
      <h2 className="text-xl font-semibold">{form.name}</h2>
      {formError ? <p role="alert" className="rounded-md border border-red-600 bg-red-50 p-3 text-sm text-red-800">{formError}</p> : null}
      {form.fields.map((field) => {
        const id = `${uid}-${field.id}`
        const error = errors[field.key]
        return (
          <div key={field.id} className="space-y-1.5">
            <label htmlFor={id} className="block text-sm font-medium">
              {field.label}
              {field.required ? <span aria-hidden="true"> *</span> : null}
              {field.required ? <span className="sr-only"> (required)</span> : null}
            </label>
            <Control field={field} id={id} value={values[field.key] ?? ''} invalid={Boolean(error)} describedBy={error ? `${id}-error` : undefined} rounded={rounded} onChange={(next) => onValue(field.key, next)} />
            {error ? <p id={`${id}-error`} role="alert" className="text-sm text-red-700">{error}</p> : null}
          </div>
        )
      })}
      {form.spamProtection && onHoneypot ? (
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" name="website_url" value={honeypot ?? ''} onChange={(event) => onHoneypot(event.target.value)} />
          </label>
        </div>
      ) : null}
      {form.consentText ? (
        <div className="space-y-1">
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--lf-accent)]" checked={consent} aria-invalid={Boolean(errors.consent) || undefined} aria-describedby={errors.consent ? `${uid}-consent-error` : undefined} onChange={(event) => onConsent(event.target.checked)} />
            <span>{form.consentText}</span>
          </label>
          {errors.consent ? <p id={`${uid}-consent-error`} role="alert" className="text-sm text-red-700">{errors.consent}</p> : null}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        aria-disabled={submitting || undefined}
        className={cn('inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[var(--lf-accent)] px-5 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lf-accent)] focus-visible:ring-offset-2 disabled:opacity-70', rounded ? 'rounded-lg' : 'rounded-none')}
      >
        {submitting ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
        {form.submitLabel}
      </button>
    </form>
  )
}
