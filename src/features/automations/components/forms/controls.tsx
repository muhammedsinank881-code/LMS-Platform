import { useId, type ReactNode } from 'react'
import { FormField } from '@/components/common/FormField'
import { Input, MultiSelect, Select, Textarea, type SelectOption } from '@/components/ui'

const ANY = '__any__'

/** A labelled control with the accessibility wiring done. `error` shows under the control. */
export function Row({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: (id: string, invalid: boolean) => ReactNode
}) {
  const id = useId()
  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      {(control) => children(control.id, control.invalid)}
    </FormField>
  )
}

export function PickOne({
  label,
  value,
  onChange,
  options,
  placeholder = 'Choose…',
  error,
  hint,
}: {
  label: string
  value: string | null
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  hint?: string
}) {
  return (
    <Row label={label} error={error} hint={hint}>
      {(id, invalid) => (
        <Select id={id} invalid={invalid} options={options} value={value || undefined} onValueChange={onChange} placeholder={placeholder} />
      )}
    </Row>
  )
}

/** Like `PickOne` with an "Any" first choice that maps to `null`. */
export function PickOrAny({
  label,
  value,
  onChange,
  options,
  anyLabel = 'Any',
}: {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  options: SelectOption[]
  anyLabel?: string
}) {
  return (
    <Row label={label}>
      {(id) => (
        <Select
          id={id}
          options={[{ value: ANY, label: anyLabel }, ...options]}
          value={value ?? ANY}
          onValueChange={(next) => onChange(next === ANY ? null : next)}
        />
      )}
    </Row>
  )
}

export function PickMany({
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  error,
}: {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  options: SelectOption[]
  placeholder?: string
  hint?: string
  error?: string
}) {
  return (
    <Row label={label} hint={hint} error={error}>
      {(id, invalid) => (
        <MultiSelect id={id} invalid={invalid} options={options} value={value} onValueChange={onChange} placeholder={placeholder} />
      )}
    </Row>
  )
}

export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  suffix,
  error,
  hint,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  suffix?: string
  error?: string
  hint?: string
}) {
  return (
    <Row label={label} error={error} hint={hint}>
      {(id, invalid) => (
        <Input
          id={id}
          type="number"
          min={min}
          max={max}
          invalid={invalid}
          value={Number.isFinite(value) ? String(value) : ''}
          rightAdornment={suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : undefined}
          onChange={(event) => onChange(event.target.value === '' ? Number.NaN : Number(event.target.value))}
        />
      )}
    </Row>
  )
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  hint?: string
  multiline?: boolean
}) {
  return (
    <Row label={label} error={error} hint={hint}>
      {(id, invalid) =>
        multiline ? (
          <Textarea id={id} rows={3} invalid={invalid} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <Input id={id} invalid={invalid} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        )
      }
    </Row>
  )
}


/** Shown for triggers and actions that have nothing to configure. */
export function NoConfig({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>
}
