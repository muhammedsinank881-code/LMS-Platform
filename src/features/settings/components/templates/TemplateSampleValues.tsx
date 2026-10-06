import { Input } from '@/components/ui'
import { SAMPLE_LEAD, SAMPLE_OWNER } from '@/lib/inbox/sample-lead'

const BUILT_IN_SAMPLE: Record<string, string> = {
  'lead.name': SAMPLE_LEAD.name,
  'lead.company': SAMPLE_LEAD.company ?? '',
  'lead.phone': SAMPLE_LEAD.phone ?? '',
  'lead.email': SAMPLE_LEAD.email ?? '',
  'owner.name': SAMPLE_OWNER.name,
}

/** One sample value per variable in the template. WhatsApp reviewers and the preview both use them. */
export function TemplateSampleValues({
  variables,
  values,
  disabled,
  onChange,
}: {
  variables: string[]
  values: Record<string, string>
  disabled?: boolean
  onChange: (name: string, value: string) => void
}) {
  if (variables.length === 0) return null
  return (
    <section className="space-y-2" aria-label="Sample values">
      <div>
        <h3 className="text-sm font-medium">Sample values</h3>
        <p className="text-xs text-muted-foreground">Used in the preview and sent to WhatsApp for review. Leave blank to use the sample lead.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {variables.map((name) => (
          <label key={name} className="space-y-1 text-xs font-medium text-muted-foreground">
            <span className="font-mono">{`{{${name}}}`}</span>
            <Input
              aria-label={`Sample value for ${name}`}
              disabled={disabled}
              placeholder={BUILT_IN_SAMPLE[name] ?? 'Sample value'}
              value={values[name] ?? ''}
              onChange={(event) => onChange(name, event.target.value)}
            />
          </label>
        ))}
      </div>
    </section>
  )
}
